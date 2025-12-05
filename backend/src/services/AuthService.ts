import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { AppError } from '../middlewares/errorHandler';

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);
  private refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

  async register(username: string, email: string, password: string, displayName?: string) {
    // 检查用户是否已存在
    const existingUser = await this.userRepo.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new AppError(400, 'USER_EXISTS', '用户名或邮箱已存在');
    }

    // 哈希密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepo.create({
      username,
      email,
      passwordHash,
      displayName: displayName || username,
    });

    await this.userRepo.save(user);

    // 生成令牌
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // 查找用户
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '邮箱或密码错误');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    // 生成令牌
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshTokenString: string) {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new AppError(500, 'SERVER_ERROR', '刷新令牌密钥未配置');
    }

    try {
      // 验证刷新令牌
      const decoded = jwt.verify(refreshTokenString, secret) as { userId: number };

      // 检查刷新令牌是否在数据库中
      const refreshToken = await this.refreshTokenRepo.findOne({
        where: { token: refreshTokenString },
        relations: ['user'],
      });

      if (!refreshToken || refreshToken.userId !== decoded.userId) {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', '无效的刷新令牌');
      }

      // 检查是否过期
      if (new Date() > refreshToken.expiresAt) {
        await this.refreshTokenRepo.remove(refreshToken);
        throw new AppError(401, 'REFRESH_TOKEN_EXPIRED', '刷新令牌已过期');
      }

      // 生成新的访问令牌
      const accessToken = this.generateAccessToken(refreshToken.user);

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', '无效的刷新令牌');
      }
      throw error;
    }
  }

  async logout(refreshTokenString: string) {
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: { token: refreshTokenString },
    });

    if (refreshToken) {
      await this.refreshTokenRepo.remove(refreshToken);
    }
  }

  private async generateTokens(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshTokenString = this.generateRefreshToken(user);

    // 保存刷新令牌到数据库
    const refreshToken = this.refreshTokenRepo.create({
      userId: user.id,
      token: refreshTokenString,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天
    });

    await this.refreshTokenRepo.save(refreshToken);

    return { accessToken, refreshToken: refreshTokenString };
  }

  private generateAccessToken(user: User): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError(500, 'SERVER_ERROR', 'JWT密钥未配置');
    }

    return jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '15m' }
    );
  }

  private generateRefreshToken(user: User): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new AppError(500, 'SERVER_ERROR', '刷新令牌密钥未配置');
    }

    return jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: '7d' }
    );
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async getUserById(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
    }
    return this.sanitizeUser(user);
  }
}
