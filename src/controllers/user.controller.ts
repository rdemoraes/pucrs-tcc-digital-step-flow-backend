import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { userRepository } from '../repositories/user.repository'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

class UserController {
  async getProfile (req: AuthRequest, res: Response): Promise<void> {
    if (req.user === undefined || req.user === null) {
      throw new AppError('User not authenticated', 401)
    }

    const requestId = req.request_id
    const userId = req.user.id

    logger.info('Fetching user profile', {
      request_id: requestId,
      user_id: userId
    })

    const user = await userRepository.findById(req.user.id)
    if (user === null || user === undefined) {
      logger.warn('User profile not found', {
        request_id: requestId,
        user_id: userId
      })
      throw new AppError('User not found', 404)
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    })
  }

  async updateProfile (req: AuthRequest, res: Response): Promise<void> {
    if (req.user === undefined || req.user === null) {
      throw new AppError('User not authenticated', 401)
    }

    const requestId = req.request_id
    const userId = req.user.id
    const { name } = req.body

    logger.info('Updating user profile', {
      request_id: requestId,
      user_id: userId
    })

    const user = await userRepository.update(req.user.id, { name })

    logger.info('User profile updated successfully', {
      request_id: requestId,
      user_id: userId
    })

    res.json({
      id: user.id,
      email: user.email,
      name: user.name
    })
  }
}

export const userController = new UserController()
