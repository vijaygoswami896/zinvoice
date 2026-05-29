import { Request, Response, NextFunction } from 'express';
declare const authenticate: (req: Request, _res: Response, next: NextFunction) => void;
export default authenticate;
