import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export class AppError extends Error {
  statusCode?: number

  constructor (message: string, statusCode?: number) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorHandler (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode !== undefined ? err.statusCode : 500
  const message = (err.message !== undefined && err.message !== '') ? err.message : 'Internal server error'

  const logContext: Record<string, string | number | undefined> = {
    request_id: req.request_id,
    path: req.path,
    method: req.method,
    status_code: statusCode,
    error_message: message
  }

  // Add user_id if available
  if (req.user?.id !== undefined) {
    logContext.user_id = req.user.id
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack !== undefined && err.stack !== '') {
    logContext.stack = err.stack
  }

  logger.error('Request error', logContext)

  res.status(statusCode).json({
    message,
    request_id: req.request_id,
    ...(process.env.NODE_ENV === 'development' && err.stack !== undefined ? { stack: err.stack } : {})
  })
}
