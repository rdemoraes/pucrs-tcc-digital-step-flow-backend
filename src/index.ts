import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.routes'
import { userRouter } from './routes/user.routes'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger.middleware'
import { logger } from './utils/logger'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080
const SERVICE_NAME = process.env.SERVICE_NAME || 'digital-step-flow-backend'

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware (must be after body parsing to access request data)
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(PORT, '0.0.0.0', () => {
  logger.info('Server started', {
    port: PORT,
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV || 'development',
  })
})

