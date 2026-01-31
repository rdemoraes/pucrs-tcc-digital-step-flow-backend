import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export function authenticateToken (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  const token = (typeof authHeader === 'string' && authHeader !== '') ? authHeader.split(' ')[1] : undefined

  if (token === undefined || token === null || token === '') {
    throw new AppError('Access token required', 401)
  }

  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret === undefined || jwtSecret === '') {
    throw new AppError('JWT secret not configured', 500)
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string
      email: string
      name: string
    }
    req.user = decoded
    next()
  } catch (error) {
    throw new AppError('Invalid or expired token', 401)
  }
}
