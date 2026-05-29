import { z } from 'zod';
import { UNITS, VALID_GST_RATES } from '../constants/products';
import { emptyStringToUndefined, withDefault } from './shared.schema';

// ── Body: create / update ─────────────────────────────────────────────────────

export const ProductBodySchema = z
    .object({
        name: z
            .string({
                required_error: 'Product name is required',
            })
            .trim()
            .min(2, 'At least 2 characters')
            .max(200, 'Max 200 characters'),

        type: z.enum(['goods', 'service'], {
            required_error: 'Type is required',
            invalid_type_error: 'Type must be goods or service',
        }),

        hsnSacCode: z
            .string()
            .trim()
            .regex(/^\d{4,8}$/, 'Must be 4 to 8 digits')
            .optional()
            .or(z.literal('')),

        price: z.coerce
            .number({
                required_error: 'Price is required',
            })
            .min(0, 'Price cannot be negative')
            .multipleOf(0.01, 'Max 2 decimal places'),

        unit: z.enum(UNITS, {
            required_error: 'Unit is required',
            invalid_type_error: `Unit must be one of: ${UNITS.join(', ')}`,
        }),

        // gstRate: z
        //     .number({
        //         required_error: 'GST rate is required',
        //     })
        //     .refine((v) => VALID_GST_RATES.includes(v as never), {
        //         message: `GST rate must be one of: ${VALID_GST_RATES.join(', ')}`,
        //     }),

        gstRate: z.coerce
            .number({ required_error: 'GST rate is required' })
            .refine((v) => VALID_GST_RATES.includes(v as never), {
                message: `GST rate must be one of: ${VALID_GST_RATES.join(', ')}`,
            }),

        taxIncluded: z.boolean().default(false),

        inventoryEnabled: z.boolean().default(false),

        stockQuantity: z.coerce
            .number()
            .int('Must be a whole number')
            .min(0, 'Cannot be negative')
            .default(0),

        lowStockThreshold: z.coerce
            .number()
            .int('Must be a whole number')
            .min(0, 'Cannot be negative')
            .default(10),

        description: z
            .string()
            .trim()
            .max(1000, 'Max 1000 characters')
            .optional()
            .or(z.literal('')),

        isActive: z.boolean().default(true),
    })
    // Business rule: services cannot have inventory
    .refine(
        (data) => !(data.type === 'service' && data.inventoryEnabled),
        {
            message: 'Services cannot have inventory tracking',
            path: ['inventoryEnabled'],
        }
    );

// ── Stock adjustment ──────────────────────────────────────────────────────────

export const StockAdjustmentSchema = z.object({
    quantity: z.number().int('Must be a whole number'),

    reason: z
        .string()
        .trim()
        .max(200, 'Max 200 characters')
        .optional(),
});

// ── List query ────────────────────────────────────────────────────────────────

// export const ProductListQuerySchema = z.object({
//     page: z.coerce.number().int().min(1).default(1),
//     limit: z.coerce.number().int().min(1).max(100).default(25),
//     search: z.string().trim().max(100).optional(),
//     type: z.enum(['goods', 'service']).optional(),
//     gstRate: z.coerce
//         .number()
//         .refine((v) => VALID_GST_RATES.includes(v as never), {
//             message: `GST rate must be one of: ${VALID_GST_RATES.join(', ')}`,
//         })
//         .optional(),

//     isActive: z.enum(['true', 'false']).optional(),
//     lowStock: z.enum(['true']).optional(),
//     sortBy: z
//         .enum([
//             'name',
//             'price',
//             'stockQuantity',
//             'createdAt',
//             'updatedAt',
//         ])
//         .default('createdAt'),

//     sortDir: z.enum(['asc', 'desc']).default('desc'),
// });

export const ProductListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(100).optional(),
    type: z.preprocess(emptyStringToUndefined, z.enum(['goods', 'service']).optional()),
    gstRate: z.preprocess(
        emptyStringToUndefined,
        z.coerce.number().refine(
            (v) => VALID_GST_RATES.includes(v as never),
            { message: `GST rate must be one of: ${VALID_GST_RATES.join(', ')}` }
        ).optional()
    ),
    isActive: z.preprocess(emptyStringToUndefined, z.enum(['true', 'false']).optional()),
    lowStock: z.preprocess(emptyStringToUndefined, z.enum(['true']).optional()),
    sortBy: withDefault(
        z.enum(['name', 'price', 'stockQuantity', 'createdAt', 'updatedAt']),
        'createdAt'
    ),
    sortDir: withDefault(z.enum(['asc', 'desc']), 'desc'),
});

// ── ID param ──────────────────────────────────────────────────────────────────

export const ProductIdParamSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type ProductBodyInput = z.infer<typeof ProductBodySchema>;

export type ProductListQueryInput = z.infer<
    typeof ProductListQuerySchema
>;

export type ProductIdParamInput = z.infer<
    typeof ProductIdParamSchema
>;

export type StockAdjustmentInput = z.infer<
    typeof StockAdjustmentSchema
>;