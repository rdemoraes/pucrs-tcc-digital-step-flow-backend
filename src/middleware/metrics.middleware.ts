import { Request, Response, NextFunction } from 'express'
import { httpRequestDuration, httpRequestsTotal, httpRequestErrors, httpActiveRequests } from '../utils/metrics'

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip metrics endpoint itself
  if (req.path === '/metrics') {
    return next()
  }

  const startTime = Date.now()

  // Increment active requests
  httpActiveRequests.inc()

  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000 // Convert to seconds
    const route = req.route?.path ?? req.path ?? 'unknown'
    const method = req.method
    const statusCode = res.statusCode.toString()

    // Record duration
    httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration
    )

    // Record total requests
    httpRequestsTotal.inc({ method, route, status_code: statusCode })

    // Record errors (4xx, 5xx)
    if (res.statusCode >= 400) {
      httpRequestErrors.inc({ method, route, status_code: statusCode })
    }

    // Decrement active requests
    httpActiveRequests.dec()
  })

  next()
}
