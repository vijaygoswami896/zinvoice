import { ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';
interface ValidateSchemas {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}
declare const validate: (schemas?: ValidateSchemas) => (req: Request, _res: Response, next: NextFunction) => void;
export default validate;
