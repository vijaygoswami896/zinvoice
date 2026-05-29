/**
 * Structured application error.
 * Thrown inside services/controllers; caught by the global error handler.
 *
 * @example
 *   throw new AppError('Invoice not found', 404, 'NOT_FOUND');
 */
declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details: unknown;
    /** Distinguishes expected operational errors from programmer bugs. */
    readonly isOperational: true;
    constructor(message: string, statusCode?: number, code?: string, details?: unknown);
}
export default AppError;
