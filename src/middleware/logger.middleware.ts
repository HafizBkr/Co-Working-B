import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();


  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);


  if (req.body && Object.keys(req.body).length > 0 && !req.is('multipart/form-data')) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
