import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
interface MongoServerError {
    code: number;
    keyValue?: Record<string, unknown>;
}
interface MongoCastError {
    name: 'CastError';
    value: unknown;
    path: string;
}
interface MongoValidationError {
    name: 'ValidationError';
    errors: Record<string, {
        path: string;
        message: string;
    }>;
}
type MongooseError = (MongoServerError | MongoCastError | MongoValidationError) & {
    name?: string;
    message?: string;
};
declare const errorHandler: (err: AppError & MongooseError, req: Request, res: Response, _next: NextFunction) => void;
declare const notFoundHandler: (req: Request, res: Response) => void;
export { errorHandler, notFoundHandler };
