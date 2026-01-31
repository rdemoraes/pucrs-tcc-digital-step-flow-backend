/// <reference types="express-serve-static-core" />

declare global {
  namespace Express {
    interface Request {
      request_id?: string
      start_time?: number
      user?: {
        id: string
        email: string
        name: string
      }
    }
  }
}

export {}
