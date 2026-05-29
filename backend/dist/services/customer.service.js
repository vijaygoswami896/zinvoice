import { Customer } from '../models/customer.model.js';
import AppError from '../utils/appError.js';
import logger from '../middleware/logger.js';
// ── Base filter: always scope to business and exclude soft-deleted ─────────────
const baseFilter = (businessId) => ({
    businessId,
    deletedAt: null,
});
// ── List ──────────────────────────────────────────────────────────────────────
/**
 * List customers with pagination, full-text search, and filters.
 */
const listCustomers = async (businessId, query) => {
    const { page, limit, search, gstType, state, sortBy, sortDir } = query;
    const filter = baseFilter(businessId);
    // Search: match name, email, or GSTIN (case-insensitive)
    if (search) {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
            { name: regex },
            { email: regex },
            { gstin: regex },
        ];
    }
    if (gstType)
        filter.gstType = gstType;
    if (state)
        filter['billingAddress.state'] = state;
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        Customer.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Customer.countDocuments(filter),
    ]);
    return { items, total, page, limit };
};
// ── Get single ────────────────────────────────────────────────────────────────
const getCustomer = async (businessId, customerId) => {
    const customer = await Customer.findOne({
        _id: customerId,
        ...baseFilter(businessId),
    });
    if (!customer)
        throw new AppError('Customer not found.', 404, 'NOT_FOUND');
    return customer;
};
// ── Create ────────────────────────────────────────────────────────────────────
const createCustomer = async (businessId, dto) => {
    if (dto.gstin) {
        const duplicate = await Customer.findOne({
            businessId,
            gstin: dto.gstin.toUpperCase(),
            deletedAt: null,
        });
        if (duplicate) {
            throw new AppError(`A customer with GSTIN ${dto.gstin} already exists.`, 409, 'DUPLICATE_GSTIN');
        }
    }
    const customer = await Customer.create({ ...dto, businessId });
    logger.info({ msg: 'Customer created', businessId, customerId: customer._id });
    return customer;
};
// ── Update ────────────────────────────────────────────────────────────────────
const updateCustomer = async (businessId, customerId, dto) => {
    if (dto.gstin) {
        const duplicate = await Customer.findOne({
            businessId,
            gstin: dto.gstin.toUpperCase(),
            deletedAt: null,
            _id: { $ne: customerId },
        });
        if (duplicate) {
            throw new AppError(`Another customer with GSTIN ${dto.gstin} already exists.`, 409, 'DUPLICATE_GSTIN');
        }
    }
    const customer = await Customer.findOneAndUpdate({ _id: customerId, ...baseFilter(businessId) }, { $set: dto }, { new: true, runValidators: true });
    if (!customer)
        throw new AppError('Customer not found.', 404, 'NOT_FOUND');
    logger.info({ msg: 'Customer updated', businessId, customerId });
    return customer;
};
// ── Soft delete ───────────────────────────────────────────────────────────────
const deleteCustomer = async (businessId, customerId, deletedBy) => {
    const customer = await Customer.findOneAndUpdate({ _id: customerId, ...baseFilter(businessId) }, { $set: { deletedAt: new Date(), deletedBy } }, { new: true });
    if (!customer)
        throw new AppError('Customer not found.', 404, 'NOT_FOUND');
    logger.info({ msg: 'Customer soft-deleted', businessId, customerId, deletedBy });
    return customer;
};
export { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
//# sourceMappingURL=customer.service.js.map