'use strict';

const { sendError } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const logger = require('./logger');
const env = require('../config/env');

/**
 * Maps specific Mongoose/MongoDB error names and codes to
 * structured AppError-style responses.
 */
const handleMongooseError = (err) => {
    // Duplicate key (e.g. unique email, unique invoiceNumber)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        const value = err.keyValue?.[field];
        return new AppError(
            `A record with ${field} '${value}' already exists.`,
            409,
            'DUPLICATE_KEY',
        );
    }

    // Cast error (invalid ObjectId, wrong type)
    if (err.name === 'CastError') {
        return new AppError(
            `Invalid value '${err.value}' for field '${err.path}'.`,
            400,
            'INVALID_ID',
        );
    }

    // Mongoose validation error (schema-level)
    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return new AppError('Mongoose validation failed', 422, 'VALIDATION_ERROR', details);
    }

    return null;
};

/**
 * Global error-handling middleware.
 * Must be registered LAST in the Express middleware chain.
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    // Attempt to normalise Mongoose errors first
    const mongooseErr = handleMongooseError(err);
    const error = mongooseErr || err;

    const isOperational = error.isOperational === true;
    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = isOperational ? error.message : 'An unexpected error occurred. Please try again later.';
    const details = isOperational ? (error.details || null) : null;

    // Log level based on severity
    const logPayload = {
        msg: error.message,
        code,
        statusCode,
        method: req.method,
        url: req.originalUrl,
        requestId: req.id,
        userId: req.user?.id || null,
        businessId: req.business?.id || null,
        stack: error.stack,
    };

    if (statusCode >= 500) {
        logger.error(logPayload);
    } else {
        logger.warn(logPayload);
    }

    // Never expose stack traces to clients
    return sendError(res, { message, status: statusCode, code, details });
};

/**
 * Catch-all for requests that don't match any route.
 *
 * @type {import('express').RequestHandler}
 */
const notFoundHandler = (req, res) => {
    return sendError(res, {
        message: `Route ${req.method} ${req.originalUrl} not found.`,
        status: 404,
        code: 'NOT_FOUND',
    });
};

module.exports = { errorHandler, notFoundHandler };