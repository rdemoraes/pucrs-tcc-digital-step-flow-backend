import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authenticateToken } from '../middleware/auth.middleware'

export const userRouter = Router()

// All user routes require authentication
userRouter.use(authenticateToken)

userRouter.get('/profile', userController.getProfile)
userRouter.put('/profile', userController.updateProfile)
