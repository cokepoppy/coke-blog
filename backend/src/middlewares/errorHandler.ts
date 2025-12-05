import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return errorResponse(res, err.code, err.message, err.statusCode, err.details);
  }

  // 默认错误
  return errorResponse(
    res,
    'INTERNAL_SERVER_ERROR',
    '服务器内部错误',
    500,
    process.env.NODE_ENV === 'development' ? err.message : undefined
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  return errorResponse(res, 'NOT_FOUND', '请求的资源不存在', 404);
};
