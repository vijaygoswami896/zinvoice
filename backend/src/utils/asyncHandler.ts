import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncHandler): RequestHandler =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export default asyncHandler;


// 'use strict';

// /**
//  * Wraps an async Express route handler and forwards any thrown error
//  * to the next() error-handling middleware automatically.
//  *
//  * Usage:
//  *   router.get('/resource', asyncHandler(async (req, res) => {
//  *     const data = await someService.getData();
//  *     sendSuccess(res, { data });
//  *   }));
//  *
//  * @param {Function} fn - Async (req, res, next) handler
//  * @returns {Function}  - Standard Express middleware
//  */
// const asyncHandler = (fn) => (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
// };

// module.exports = asyncHandler;