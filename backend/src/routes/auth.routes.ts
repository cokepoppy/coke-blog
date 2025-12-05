import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth';
import { body } from 'express-validator';

const router = Router();
const controller = new AuthController();

// 注册
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 50 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  controller.register
);

// 登录
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  controller.login
);

// 刷新令牌
router.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  controller.refresh
);

// 登出
router.post(
  '/logout',
  [body('refreshToken').notEmpty()],
  controller.logout
);

// 获取当前用户信息
router.get('/me', authenticate, controller.getMe);

export default router;
