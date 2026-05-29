import { ZodError } from 'zod';
import AppError from '../utils/appError.js';
const formatZodErrors = (zodError) => zodError.errors.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const validate = (schemas = {}) => {
    // Fail fast at route definition time, not at request time
    if (!schemas.body && !schemas.query && !schemas.params) {
        throw new Error('validate() called with no schemas — did you mean to use it?');
    }
    return (req, _res, next) => {
        try {
            if (schemas.body)
                req.body = schemas.body.parse(req.body);
            if (schemas.query)
                req.query = schemas.query.parse(req.query);
            if (schemas.params)
                req.params = schemas.params.parse(req.params);
            next();
        }
        catch (err) {
            if (err instanceof ZodError) {
                return next(new AppError('Validation failed', 422, 'VALIDATION_ERROR', formatZodErrors(err)));
            }
            next(err);
        }
    };
};
export default validate;
//# sourceMappingURL=validate.js.map