import { z } from 'zod';

// ── Reusable primitives ───────────────────────────────────────────────────────

const objectIdSchema = z
    .string({ required_error: 'ID is required' })
    .trim()
    .regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

const unitNameSchema = z
    .string({ required_error: 'Unit name is required' })
    .trim()
    .min(1, 'Unit name cannot be empty')
    .max(50, 'Unit name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s\-/().]+$/, 'Unit name contains invalid characters');

const shortNameSchema = z
    .string({ required_error: 'Short name is required' })
    .trim()
    .min(1, 'Short name cannot be empty')
    .max(10, 'Short name cannot exceed 10 characters')
    .regex(/^[a-zA-Z0-9./]+$/, 'Short name contains invalid characters')
    .transform((v) => v.toLowerCase());

// ── Create ────────────────────────────────────────────────────────────────────

/**
 * POST /units
 * businessId and createdBy are injected server-side from auth context —
 * never accepted from the request body.
 */
export const createUnitSchema = z.object({
    body: z.object({
        name: unitNameSchema,
        shortName: shortNameSchema,
    }),
});

// ── Update ────────────────────────────────────────────────────────────────────

/**
 * PATCH /units/:id
 * Partial update — at least one field must be provided.
 * Default (seeded) units are blocked from update at the service layer.
 */
export const updateUnitSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z
        .object({
            name: unitNameSchema.optional(),
            shortName: shortNameSchema.optional(),
        })
        .strict()
        .refine(
            (data) => Object.keys(data).length > 0,
            { message: 'At least one field must be provided for update' },
        ),
});

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * DELETE /units/:id
 * Performs a soft delete. Default units are blocked at the service layer.
 */
export const deleteUnitSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
});

// ── Get by ID ─────────────────────────────────────────────────────────────────

/**
 * GET /units/:id
 */
export const getUnitByIdSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
});

// ── List / Query ──────────────────────────────────────────────────────────────

/**
 * GET /units
 * All filters are optional. businessId is injected from auth context.
 */
export const listUnitsSchema = z.object({
    query: z.object({
        /** Filter by name (case-insensitive partial match) */
        search: z
            .string()
            .trim()
            .max(50, 'Search term cannot exceed 50 characters')
            .optional(),

        /** Show only default/seeded units or only custom ones */
        isDefault: z
            .enum(['true', 'false'], { message: 'isDefault must be true or false' })
            .transform((v) => v === 'true')
            .optional(),

        /** Include soft-deleted units (admin/audit use only) */
        includeDeleted: z
            .enum(['true', 'false'], { message: 'includeDeleted must be true or false' })
            .transform((v) => v === 'true')
            .optional(),

        /** Pagination */
        page: z
            .string()
            .trim()
            .optional()
            .transform((v) => (v !== undefined ? parseInt(v, 10) : 1))
            .pipe(z.number().int().min(1, 'Page must be at least 1')),

        limit: z
            .string()
            .trim()
            .optional()
            .transform((v) => (v !== undefined ? parseInt(v, 10) : 20))
            .pipe(z.number().int().min(1).max(100, 'Limit cannot exceed 100')),

        /** Sort field */
        sortBy: z
            .enum(['name', 'shortName', 'createdAt'], {
                message: 'sortBy must be one of: name, shortName, createdAt',
            })
            .optional()
            .default('name'),

        /** Sort direction */
        sortOrder: z
            .enum(['asc', 'desc'], { message: 'sortOrder must be asc or desc' })
            .optional()
            .default('asc'),
    }),
});

// ── Restore (soft-delete recovery) ───────────────────────────────────────────

/**
 * PATCH /units/:id/restore
 */
export const restoreUnitSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
});