import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/PostService';
import { successResponse, paginatedResponse } from '../utils/response';
import { PostStatus } from '../entities/Post';

const postService = new PostService();

export class PostController {
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        limit = '10',
        status,
        category,
        tag,
        search,
        sort = 'latest',
      } = req.query;

      const result = await postService.getPosts({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as PostStatus,
        category: category as string,
        tag: tag as string,
        search: search as string,
        sort: sort as 'latest' | 'popular' | 'oldest',
      });

      return paginatedResponse(
        res,
        result.posts,
        result.page,
        result.limit,
        result.total,
        '获取文章列表成功'
      );
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const post = await postService.getPostById(parseInt(id));

      return successResponse(res, post, '获取文章详情成功');
    } catch (error) {
      next(error);
    }
  }

  async getPostBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const post = await postService.getPostBySlug(slug);

      return successResponse(res, post, '获取文章详情成功');
    } catch (error) {
      next(error);
    }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = { ...req.body, authorId: userId };

      const post = await postService.createPost(data);

      return successResponse(res, post, '创建文章成功', 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const post = await postService.updatePost(parseInt(id), req.body, userId);

      return successResponse(res, post, '更新文章成功');
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await postService.deletePost(parseInt(id), userId);

      return successResponse(res, null, '删除文章成功');
    } catch (error) {
      next(error);
    }
  }

  async publishPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const post = await postService.publishPost(parseInt(id), userId);

      return successResponse(res, post, '发布文章成功');
    } catch (error) {
      next(error);
    }
  }

  async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await postService.likePost(parseInt(id));

      return successResponse(res, result, '点赞成功');
    } catch (error) {
      next(error);
    }
  }
}
