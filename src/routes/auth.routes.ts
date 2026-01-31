import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { validateRequest } from '../middleware/validateRequest'
import { authenticateToken } from '../middleware/auth.middleware'
import { loginSchema, registerSchema } from '../schemas/auth.schemas'

export const authRouter = Router()

authRouter.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
)

authRouter.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
)

authRouter.get(
  '/me',
  authenticateToken,
  authController.getMe
)
