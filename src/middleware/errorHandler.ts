import type{ Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
    console.log("[global err handler] ",err.message, " : ", err.stack)
    err.statusCode = err.statusCode || 500;

    let message = 'Internal Server Error'
    if (err instanceof AppError) {
        message = err.message;
    }

    res.status(err.statusCode).json({
      message: message,
    });
};