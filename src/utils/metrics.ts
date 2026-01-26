import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

// Create a registry for metrics
export const register = new Registry()

// Default Node.js metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({ register })

// HTTP Request Metrics - RED (Rate, Errors, Duration)
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Standard latency buckets
  registers: [register]
})

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors (4xx, 5xx)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

// Request Rate (RPS) - calculated from http_requests_total by Prometheus
// We expose it as a gauge for current active requests
export const httpActiveRequests = new Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests',
  registers: [register]
})

// Application-specific metrics
export const appInfo = new Gauge({
  name: 'app_info',
  help: 'Application information',
  labelNames: ['service', 'version', 'environment'],
  registers: [register]
})

// Database connection metrics (if needed later)
export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
  registers: [register]
})
