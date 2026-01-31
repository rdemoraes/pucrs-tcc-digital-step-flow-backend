import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { AppError } from './errorHandler'

function formatZodErrors (error: ZodError): string {
  return error.errors.map((e) => e.message).join(', ')
}

export function validateRequest (schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      })
      ;(next as (err?: unknown) => void)()
    } catch (error: unknown) {
      const message = error instanceof ZodError
        ? formatZodErrors(error)
        : 'Validation failed'
      throw new AppError(message, 400)
    }
  }
}
