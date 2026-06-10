import { Request } from 'express';
import AppError from './appError.js';

const getBusinessId = (req: Request): string => {
    const id = req.user?.businessId;
    // if (!id) throw new AppError('Business context missing', 401, 'UNAUTHORIZED');
    if (!id) throw new AppError('Business context missing', 403, 'FORBIDDEN');
    return id;
};

export default getBusinessId;