import { ZodError, ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

interface ValidateSchemas {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}

const formatZodErrors = (zodError: ZodError) =>
    zodError.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));

const validate = (schemas: ValidateSchemas = {}) =>
    (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (schemas.body) req.body = schemas.body.parse(req.body);
            if (schemas.query) req.query = schemas.query.parse(req.query);
            if (schemas.params) req.params = schemas.params.parse(req.params);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return next(new AppError('Validation failed', 422, 'VALIDATION_ERROR', formatZodErrors(err)));
            }
            next(err);
        }
    };

export default validate;
