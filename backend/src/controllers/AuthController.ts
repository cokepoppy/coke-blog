import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { successResponse } from '../utils/response';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, displayName } = req.body;

      const result = await authService.register(username, email, password, displayName);

      return successResponse(res, result, '注册成功', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return successResponse(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshAccessToken(refreshToken);

      return successResponse(res, result, '令牌刷新成功');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      await authService.logout(refreshToken);

      return successResponse(res, null, '登出成功');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const user = await authService.getUserById(userId);

      return successResponse(res, user, '获取用户信息成功');
    } catch (error) {
      next(error);
    }
  }
}
