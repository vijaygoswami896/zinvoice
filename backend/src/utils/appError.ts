/**
 * Structured application error.
 * Thrown inside services/controllers; caught by the global error handler.
 *
 * @example
 *   throw new AppError('Invoice not found', 404, 'NOT_FOUND');
 */
class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details: unknown;
    /** Distinguishes expected operational errors from programmer bugs. */
    public readonly isOperational: true = true;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        details: unknown = null,
    ) {
        super(message);

        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;


// 'use strict';

// /**
//  * Structured application error.
//  * Thrown inside services/controllers; caught by the global error handler.
//  *
//  * @example
//  *   throw new AppError('Invoice not found', 404, 'NOT_FOUND');
//  */
// class AppError extends Error {
//     /**
//      * @param {string} message    - User-facing message
//      * @param {number} statusCode - HTTP status
//      * @param {string} code       - Machine-readable error code
//      * @param {*}     [details]   - Extra context (validation errors, etc.)
//      */
//     constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
//         super(message);

//         this.name = 'AppError';
//         this.statusCode = statusCode;
//         this.code = code;
//         this.details = details;
//         this.isOperational = true; // flag to distinguish from programmer errors

//         Error.captureStackTrace(this, this.constructor);
//     }
// }

// module.exports = AppError;