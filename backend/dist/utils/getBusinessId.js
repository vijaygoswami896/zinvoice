import AppError from './appError.js';
const getBusinessId = (req) => {
    const id = req.user?.businessId;
    if (!id)
        throw new AppError('Business context missing', 401, 'UNAUTHORIZED');
    return id;
};
export default getBusinessId;
//# sourceMappingURL=getBusinessId.js.map