import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any;
  isOperational?: boolean;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // Log error for server-side debugging
  console.error(`[ERROR] ${new Date().toISOString()}: ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err.errors && { errors: err.errors })
    }
  });
};

// Custom error handler for 404 routes
export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { message: `Route ${req.originalUrl} not found` } });
};
