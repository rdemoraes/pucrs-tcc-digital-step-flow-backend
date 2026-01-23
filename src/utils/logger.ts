export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface LogContext {
  request_id?: string
  user_id?: string
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  service: string
  message: string
  request_id?: string
  user_id?: string
  [key: string]: any
}

const SERVICE_NAME = process.env.SERVICE_NAME || 'digital-step-flow-backend'

class Logger {
  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: SERVICE_NAME,
      message,
      ...context,
    }

    return JSON.stringify(logEntry)
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const logMessage = this.formatLog(level, message, context)
    
    // Use stdout for INFO and DEBUG, stderr for WARN and ERROR
    if (level === 'ERROR' || level === 'WARN') {
      console.error(logMessage)
    } else {
      console.log(logMessage)
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log('ERROR', message, context)
  }
}

export const logger = new Logger()
