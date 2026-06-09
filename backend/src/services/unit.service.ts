import mongoose, { FilterQuery, SortOrder } from 'mongoose';

import AppError from '../utils/appError.js';
import logger from '../middleware/logger.js';
import type {
    CreateUnitInput,
    UpdateUnitInput,
    ListUnitsInput,
} from '../schemas/unit.schema.js';
import { IUnit, Unit } from '../models/units.model.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const baseFilter = (businessId: string): FilterQuery<IUnit> => ({
    businessId,
    isDeleted: false,
});

const escapeRegex = (str: string): string =>
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── List ──────────────────────────────────────────────────────────────────────

export const listUnits = async (
    businessId: string,
    query: ListUnitsInput['query'],
) => {
    const { search, isDefault, includeDeleted, page, limit, sortBy, sortOrder } = query;

    const filter: FilterQuery<IUnit> = includeDeleted
        ? { businessId }
        : baseFilter(businessId);

    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i');
        filter.$or = [
            { name: regex },
            { shortName: regex },
        ];
    }

    if (isDefault !== undefined) filter.isDefault = isDefault;

    const sort: Record<string, SortOrder> = {
        isDefault: -1,
        [sortBy ?? 'name']: sortOrder === 'desc' ? -1 : 1,
    };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Unit.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
        Unit.countDocuments(filter),
    ]);

    return { items, total, page, limit };
};

// ── Get single ────────────────────────────────────────────────────────────────

export const getUnit = async (
    businessId: string,
    unitId: string,
): Promise<IUnit> => {
    const unit = await Unit.findOne({ _id: unitId, ...baseFilter(businessId) });

    if (!unit) throw new AppError('Unit not found', 404, 'NOT_FOUND');

    return unit;
};

// ── Create ────────────────────────────────────────────────────────────────────

export const createUnit = async (
    businessId: string,
    userId: string,
    body: CreateUnitInput['body'],
): Promise<IUnit> => {
    const existing = await Unit.findOne({
        businessId,
        $or: [
            { name: new RegExp(`^${escapeRegex(body.name)}$`, 'i') },
            { shortName: body.shortName.toLowerCase() },
        ],
        isDeleted: false,
    });

    if (existing) {
        const conflict =
            existing.name.toLowerCase() === body.name.toLowerCase()
                ? 'name'
                : 'short name';
        throw new AppError(
            `A unit with this ${conflict} already exists`,
            409,
            'UNIT_DUPLICATE',
        );
    }

    const unit = await Unit.create({
        businessId,
        createdBy: userId,
        name: body.name,
        shortName: body.shortName,
        isDefault: false,
    });

    logger.info({ msg: 'Unit created', businessId, unitId: unit._id });

    return unit;
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updateUnit = async (
    businessId: string,
    userId: string,
    unitId: string,
    body: UpdateUnitInput['body'],
): Promise<IUnit> => {
    const unit = await Unit.findOne({ _id: unitId, ...baseFilter(businessId) });

    if (!unit) throw new AppError('Unit not found', 404, 'NOT_FOUND');

    if (unit.isDefault) {
        throw new AppError(
            'Default units cannot be modified',
            403,
            'UNIT_DEFAULT_IMMUTABLE',
        );
    }

    const checks: FilterQuery<IUnit>[] = [];
    if (body.name) checks.push({ name: new RegExp(`^${escapeRegex(body.name)}$`, 'i') });
    if (body.shortName) checks.push({ shortName: body.shortName.toLowerCase() });

    if (checks.length > 0) {
        const conflict = await Unit.findOne({
            businessId,
            _id: { $ne: unitId },
            $or: checks,
            isDeleted: false,
        });

        if (conflict) {
            const field =
                body.name &&
                    conflict.name.toLowerCase() === body.name.toLowerCase()
                    ? 'name'
                    : 'short name';
            throw new AppError(
                `A unit with this ${field} already exists`,
                409,
                'UNIT_DUPLICATE',
            );
        }
    }

    if (body.name) unit.name = body.name;
    if (body.shortName) unit.shortName = body.shortName;
    unit.updatedBy = new mongoose.Types.ObjectId(userId);

    await unit.save();

    logger.info({ msg: 'Unit updated', businessId, unitId });

    return unit;
};

// ── Soft delete ───────────────────────────────────────────────────────────────

export const deleteUnit = async (
    businessId: string,
    unitId: string,
    deletedBy: string,
): Promise<void> => {
    const unit = await Unit.findOne({ _id: unitId, ...baseFilter(businessId) });

    if (!unit) throw new AppError('Unit not found', 404, 'NOT_FOUND');

    if (unit.isDefault) {
        throw new AppError(
            'Default units cannot be deleted',
            403,
            'UNIT_DEFAULT_IMMUTABLE',
        );
    }

    unit.softDelete(new mongoose.Types.ObjectId(deletedBy));
    await unit.save();

    logger.info({ msg: 'Unit soft-deleted', businessId, unitId, deletedBy });
};

// ── Restore ───────────────────────────────────────────────────────────────────

export const restoreUnit = async (
    businessId: string,
    userId: string,
    unitId: string,
): Promise<IUnit> => {
    const unit = await Unit.findOne({
        _id: unitId,
        businessId,
        isDeleted: true,
    }).select('+isDeleted +deletedAt +deletedBy');

    if (!unit) throw new AppError('Unit not found', 404, 'NOT_FOUND');

    unit.restore();
    unit.updatedBy = new mongoose.Types.ObjectId(userId);
    await unit.save();

    logger.info({ msg: 'Unit restored', businessId, unitId });

    return unit;
};