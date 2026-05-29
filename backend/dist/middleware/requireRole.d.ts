import { Request, Response, NextFunction } from 'express';
declare const requireRole: (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
export default requireRole;
