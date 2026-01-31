import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Generate request ID if not present
  req.request_id = req.headers['x-request-id'] as string || uuidv4()
  req.start_time = Date.now()

  // Log incoming request
  logger.info('Incoming request', {
    request_id: req.request_id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    user_agent: req.get('user-agent'),
  })

  // Capture response finish event
  res.on('finish', () => {
    const duration = req.start_time ? Date.now() - req.start_time : 0
    
    const logContext: Record<string, string | number | undefined> = {
      request_id: req.request_id,
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      duration_ms: duration,
    }

    // Add user_id if available (from auth middleware)
    if (req.user?.id) {
      logContext.user_id = req.user.id
    }

    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', logContext)
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', logContext)
    } else {
      logger.info('Request completed successfully', logContext)
    }
  })

  next()
}

