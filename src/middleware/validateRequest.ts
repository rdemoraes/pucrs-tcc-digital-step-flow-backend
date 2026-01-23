import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { AppError } from './errorHandler'

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error: any) {
      throw new AppError(
        error.errors?.map((e: any) => e.message).join(', ') || 'Validation failed',
        400
      )
    }
  }
}

