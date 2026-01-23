import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface AppError extends Error {
  statusCode?: number
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  const logContext: any = {
    request_id: (req as any).request_id,
    path: req.path,
    method: req.method,
    status_code: statusCode,
    error_message: message,
  }

  // Add user_id if available
  if ((req as any).user?.id) {
    logContext.user_id = (req as any).user.id
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    logContext.stack = err.stack
  }

  logger.error('Request error', logContext)

  res.status(statusCode).json({
    message,
    request_id: (req as any).request_id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

