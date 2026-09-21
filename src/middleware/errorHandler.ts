import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/CustomErrors';
import logger from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Bỏ qua logging 404 cho favicon
  if (req.originalUrl !== '/favicon.ico') {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: (req as any).user?.userId
    });
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errors: (err as any).errors
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
