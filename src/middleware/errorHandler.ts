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
    console.log("[global err handler] :", err.stack)

    if (err.name === 'CastError' || err.code === 'P2023') {
      return res.status(400).json({
        message: "Invalid ID format"
      });
    }
    // Handle Prisma unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: "Resource already exists"
      });
    }
    // Handle Prisma record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: "Resource not found"
      });
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Invalid token"
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Token expired"
      });
    }
    
    const statusCode = err.statusCode || 500;
    let message = 'Internal Server Error'
    if (err instanceof AppError) {
        message = err.message;
    }

    res.status(statusCode).json({
      message: message,
    });
};