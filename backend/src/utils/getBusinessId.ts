import { Request } from 'express';
import AppError from './appError';

const getBusinessId = (req: Request): string => {
    const id = req.user?.businessId ?? req.user?.id;
    if (!id) throw new AppError('Business context missing', 401, 'UNAUTHORIZED');
    return id;
};

export default getBusinessId;