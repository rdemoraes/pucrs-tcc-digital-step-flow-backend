import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userRepository } from '../repositories/user.repository'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth.middleware'
import { logger } from '../utils/logger'

class AuthController {
  async register (req: Request, res: Response): Promise<void> {
    const { email, password, name } = req.body
    const requestId = req.request_id

    logger.info('User registration attempt', {
      request_id: requestId,
      email
    })

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser !== null && existingUser !== undefined) {
      logger.warn('User registration failed - user already exists', {
        request_id: requestId,
        email
      })
      throw new AppError('User already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name
    })

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret === undefined || jwtSecret === '') {
      throw new AppError('JWT secret not configured', 500)
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
    )

    logger.info('User registration successful', {
      request_id: requestId,
      user_id: user.id,
      email: user.email
    })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  }

  async login (req: Request, res: Response): Promise<void> {
    const { email, password } = req.body
    const requestId = req.request_id

    logger.info('User login attempt', {
      request_id: requestId,
      email
    })

    // Find user
    const user = await userRepository.findByEmail(email)
    if (user === null || user === undefined) {
      logger.warn('User login failed - user not found', {
        request_id: requestId,
        email
      })
      throw new AppError('Invalid credentials', 401)
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (isValidPassword !== true) {
      logger.warn('User login failed - invalid password', {
        request_id: requestId,
        email,
        user_id: user.id
      })
      throw new AppError('Invalid credentials', 401)
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret === undefined || jwtSecret === '') {
      throw new AppError('JWT secret not configured', 500)
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
    )

    logger.info('User login successful', {
      request_id: requestId,
      user_id: user.id,
      email: user.email
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  }

  async getMe (req: AuthRequest, res: Response): Promise<void> {
    if (req.user === undefined || req.user === null) {
      throw new AppError('User not authenticated', 401)
    }

    res.json(req.user)
  }
}

export const authController = new AuthController()
