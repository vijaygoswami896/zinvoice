import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';
import AppError from '../utils/appError.js';
import logger from './logger.js';

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
    errors: Record<string, { path: string; message: string }>;
}

type MongooseError = (MongoServerError | MongoCastError | MongoValidationError) & {
    name?: string;
    message?: string;
};

const handleMongooseError = (err: MongooseError): AppError | null => {
    const serverErr = err as MongoServerError;

    if (serverErr.code === 11000) {
        const field = Object.keys(serverErr.keyValue ?? {})[0] ?? 'field';
        const value = serverErr.keyValue?.[field];
        return new AppError(`A record with ${field} '${value}' already exists.`, 409, 'DUPLICATE_KEY');
    }

    if (err.name === 'CastError') {
        const castErr = err as MongoCastError;
        return new AppError(`Invalid value '${castErr.value}' for field '${castErr.path}'.`, 400, 'INVALID_ID');
    }

    if (err.name === 'ValidationError') {
        const validationErr = err as MongoValidationError;
        const details = Object.values(validationErr.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return new AppError('Mongoose validation failed', 422, 'VALIDATION_ERROR', details);
    }

    if (err.name === 'TokenExpiredError') {
        return new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }

    if (err.name === 'JsonWebTokenError') {
        return new AppError('Invalid token. Please log in again.', 401, 'TOKEN_INVALID');
    }

    return null;
};

const errorHandler = (err: AppError & MongooseError, req: Request, res: Response, _next: NextFunction): void => {
    const mongooseErr = handleMongooseError(err);
    const error = mongooseErr ?? err;

    const isOperational = error.isOperational === true;
    const statusCode = error.statusCode ?? 500;
    const code = error.code ?? 'INTERNAL_ERROR';
    const message = isOperational ? error.message : 'An unexpected error occurred. Please try again later.';
    const details = isOperational ? (error.details ?? null) : null;

    const logPayload = {
        msg: error.message,
        code,
        statusCode,
        method: req.method,
        url: req.originalUrl,
        requestId: req.id,
        userId: req.user?.id ?? null,
        businessId: req.business?.id ?? null,
        stack: error.stack,
    };

    if (statusCode >= 500) {
        logger.error(logPayload);
    } else {
        logger.warn(logPayload);
    }

    sendError(res, { message, status: statusCode, code, details });
};

const notFoundHandler = (req: Request, res: Response): void => {
    sendError(res, {
        message: `Route ${req.method} ${req.originalUrl} not found.`,
        status: 404,
        code: 'NOT_FOUND',
    });
};

export { errorHandler, notFoundHandler };