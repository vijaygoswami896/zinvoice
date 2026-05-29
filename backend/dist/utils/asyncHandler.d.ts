import { Request, Response, NextFunction, RequestHandler } from 'express';
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const asyncHandler: (fn: AsyncHandler) => RequestHandler;
export default asyncHandler;
