import mongoose from 'mongoose';

import { Unit } from '../models/units.model.js';
import AppError from '../utils/appError.js';
import type {
    CreateUnitInput,
    UpdateUnitInput,
    DeleteUnitInput,
    GetUnitByIdInput,
    ListUnitsInput,
    RestoreUnitInput,
} from '../schemas/unit.schema.js';

// interface PaginatedUnits {
//     data: Awaited<ReturnType<typeof Unit.prototype.toJSON>>[];
//     total: number;
//     page: number;
//     limit: number;
//     totalPages: number;
// }

// ── Helpers ───────────────────────────────────────────────────────────────────

function toObjectId(id: string, label = 'ID'): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(`Invalid ${label}`, 400, 'INVALID_ID');
    }
    return new mongoose.Types.ObjectId(id);
}

async function findUnitOrFail(
    id: string,
    businessId: mongoose.Types.ObjectId,
    includeDeleted = false,
) {
    const unitId = toObjectId(id, 'unit ID');

    const filter: Record<string, unknown> = { _id: unitId, businessId };
    if (!includeDeleted) filter.isDeleted = false;

    const unit = await Unit.findOne(filter).select('+isDeleted +deletedAt +deletedBy');
    if (!unit) throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');

    return unit;
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Create a new custom unit for the tenant.
 */
async function createUnit(
    body: CreateUnitInput['body'],
    auth: AuthContext,
) {
    // Duplicate check is enforced by the DB partial-unique index,
    // but we give a friendlier message by checking first.
    const existing = await Unit.findOne({
        businessId: auth.businessId,
        $or: [
            { name: new RegExp(`^${body.name}$`, 'i') },
            { shortName: body.shortName.toLowerCase() },
        ],
        isDeleted: false,
    });

    if (existing) {
        const conflict = existing.name.toLowerCase() === body.name.toLowerCase()
            ? 'name'
            : 'short name';
        throw new AppError(
            `A unit with this ${conflict} already exists`,
            409,
            'UNIT_DUPLICATE',
        );
    }

    const unit = await Unit.create({
        businessId: auth.businessId,
        createdBy: auth.userId,
        name: body.name,
        shortName: body.shortName,
        isDefault: false,
    });

    return unit;
}

/**
 * Update name and/or shortName of a custom (non-default) unit.
 */
async function updateUnit(
    params: UpdateUnitInput['params'],
    body: UpdateUnitInput['body'],
    auth: AuthContext,
) {
    const unit = await findUnitOrFail(params.id, auth.businessId);

    if (unit.isDefault) {
        throw new AppError(
            'Default units cannot be modified',
            403,
            'UNIT_DEFAULT_IMMUTABLE',
        );
    }

    // Conflict check only for fields that are actually changing
    const checks: { name?: RegExp; shortName?: string }[] = [];
    if (body.name) checks.push({ name: new RegExp(`^${body.name}$`, 'i') });
    if (body.shortName) checks.push({ shortName: body.shortName.toLowerCase() });

    if (checks.length > 0) {
        const conflict = await Unit.findOne({
            businessId: auth.businessId,
            _id: { $ne: unit._id },
            $or: checks,
            isDeleted: false,
        });

        if (conflict) {
            const field = body.name && conflict.name.toLowerCase() === body.name.toLowerCase()
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
    unit.updatedBy = auth.userId;

    await unit.save();
    return unit;
}

/**
 * Soft-delete a custom unit.
 * Default/seeded units cannot be deleted.
 */
async function deleteUnit(
    params: DeleteUnitInput['params'],
    auth: AuthContext,
) {
    const unit = await findUnitOrFail(params.id, auth.businessId);

    if (unit.isDefault) {
        throw new AppError(
            'Default units cannot be deleted',
            403,
            'UNIT_DEFAULT_IMMUTABLE',
        );
    }

    if (unit.isDeleted) {
        throw new AppError('Unit is already deleted', 409, 'UNIT_ALREADY_DELETED');
    }

    unit.softDelete(auth.userId);
    await unit.save();
}

/**
 * Restore a previously soft-deleted unit.
 */
async function restoreUnit(
    params: RestoreUnitInput['params'],
    auth: AuthContext,
) {
    const unit = await findUnitOrFail(params.id, auth.businessId, true);

    if (!unit.isDeleted) {
        throw new AppError('Unit is not deleted', 409, 'UNIT_NOT_DELETED');
    }

    unit.restore();
    unit.updatedBy = auth.userId;
    await unit.save();

    return unit;
}

/**
 * Fetch a single active unit by ID.
 */
async function getUnitById(
    params: GetUnitByIdInput['params'],
    auth: AuthContext,
) {
    return findUnitOrFail(params.id, auth.businessId);
}

/**
 * Paginated list of units for the tenant with optional filters.
 */
async function listUnits(
    query: ListUnitsInput['query'],
    auth: AuthContext,
): Promise<PaginatedUnits> {
    const {
        search,
        isDefault,
        includeDeleted,
        page,
        limit,
        sortBy,
        sortOrder,
    } = query;

    const filter: Record<string, unknown> = { businessId: auth.businessId };

    if (!includeDeleted) filter.isDeleted = false;

    if (search) {
        filter.$or = [
            { name: new RegExp(search, 'i') },
            { shortName: new RegExp(search, 'i') },
        ];
    }

    if (isDefault !== undefined) filter.isDefault = isDefault;

    const sortField = sortBy ?? 'name';
    const sortDir = sortOrder ?? 'asc';
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        Unit.find(filter)
            .select('-__v')
            .sort({ isDefault: -1, [sortField]: sortDir === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec(),
        Unit.countDocuments(filter),
    ]);

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

// ── Exports ───────────────────────────────────────────────────────────────────

export const unitService = {
    createUnit,
    updateUnit,
    deleteUnit,
    restoreUnit,
    getUnitById,
    listUnits,
};