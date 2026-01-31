declare module 'express-serve-static-core' {
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
