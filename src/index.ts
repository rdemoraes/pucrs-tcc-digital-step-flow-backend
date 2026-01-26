import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.routes'
import { userRouter } from './routes/user.routes'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger.middleware'
import { metricsMiddleware } from './middleware/metrics.middleware'
import { logger } from './utils/logger'
import { register, appInfo } from './utils/metrics'

dotenv.config()

const PORT = process.env.PORT || 8080
const HEALTH_PORT = process.env.HEALTH_PORT || 8081
const METRICS_PORT = process.env.METRICS_PORT || 8082
const SERVICE_NAME = process.env.SERVICE_NAME || 'digital-step-flow-backend'
const APP_VERSION = process.env.APP_VERSION || '1.0.0'
const NODE_ENV = process.env.NODE_ENV || 'development'

// Set application info metric
appInfo.set({ service: SERVICE_NAME, version: APP_VERSION, environment: NODE_ENV }, 1)

// Main application server
const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Metrics middleware (should be early to capture all requests)
app.use(metricsMiddleware)

// Request logging middleware (must be after body parsing to access request data)
app.use(requestLogger)

// API routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Health check server (separate port for probes)
const healthApp = express()
healthApp.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME
  })
})

// Metrics server (separate port for Prometheus scraping)
const metricsApp = express()
metricsApp.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    const metrics = await register.metrics()
    res.end(metrics)
  } catch (error) {
    logger.error('Error generating metrics', { error })
    res.status(500).end('Error generating metrics')
  }
})

// Start main application server
app.listen(PORT, '0.0.0.0', () => {
  logger.info('Main server started', {
    port: PORT,
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV || 'development',
  })
})

// Start health check server
healthApp.listen(HEALTH_PORT, '0.0.0.0', () => {
  logger.info('Health check server started', {
    port: HEALTH_PORT,
    service: SERVICE_NAME,
  })
})

// Start metrics server
metricsApp.listen(METRICS_PORT, '0.0.0.0', () => {
  logger.info('Metrics server started', {
    port: METRICS_PORT,
    service: SERVICE_NAME,
  })
})

