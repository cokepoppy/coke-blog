import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { authenticate } from '../middlewares/auth';
import { body } from 'express-validator';

const router = Router();
const controller = new PostController();

// 公开路由
router.get('/', controller.getPosts);
router.get('/slug/:slug', controller.getPostBySlug);
router.get('/:id', controller.getPostById);
router.post('/:id/like', controller.likePost);

// 需要认证的路由
router.post(
  '/',
  authenticate,
  [
    body('title').isLength({ min: 1, max: 255 }).trim(),
    body('content').notEmpty(),
  ],
  controller.createPost
);

router.put('/:id', authenticate, controller.updatePost);
router.delete('/:id', authenticate, controller.deletePost);
router.post('/:id/publish', authenticate, controller.publishPost);

export default router;
