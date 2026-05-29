import { z } from 'zod';

// ── Reference data (also used by invoice form) ────────────────────────────────

export const VALID_GST_RATES = [0, 5, 12, 18, 28];

export const PRODUCT_TYPES = [
  { value: 'goods',   label: 'Goods',   description: 'Physical product with HSN code' },
  { value: 'service', label: 'Service', description: 'Intangible service with SAC code' },
];

/**
 * UQC units grouped for select display.
 * Mirrors the UNITS array in product.model.js exactly.
 */
export const UNIT_GROUPS = [
  {
    label: 'Count',
    options: [
      { value: 'PCS', label: 'PCS — Pieces' },
      { value: 'NOS', label: 'NOS — Numbers' },
      { value: 'SET', label: 'SET — Set' },
      { value: 'PAR', label: 'PAR — Pair' },
    ],
  },
  {
    label: 'Weight',
    options: [
      { value: 'KGS', label: 'KGS — Kilograms' },
      { value: 'GMS', label: 'GMS — Grams' },
    ],
  },
  {
    label: 'Volume',
    options: [
      { value: 'LTR', label: 'LTR — Litres' },
      { value: 'MLT', label: 'MLT — Millilitres' },
    ],
  },
  {
    label: 'Length / Area',
    options: [
      { value: 'MTR', label: 'MTR — Metres' },
      { value: 'SQM', label: 'SQM — Sq. metres' },
      { value: 'CBM', label: 'CBM — Cu. metres' },
      { value: 'ROL', label: 'ROL — Roll' },
    ],
  },
  {
    label: 'Packaging',
    options: [
      { value: 'BOX', label: 'BOX — Box' },
      { value: 'PKT', label: 'PKT — Packet' },
      { value: 'BAG', label: 'BAG — Bag' },
      { value: 'TUB', label: 'TUB — Tube' },
    ],
  },
  {
    label: 'Services',
    options: [
      { value: 'HRS', label: 'HRS — Hours' },
      { value: 'DAY', label: 'DAY — Days' },
      { value: 'MON', label: 'MON — Month' },
      { value: 'JOB', label: 'JOB — Job' },
    ],
  },
  {
    label: 'Other',
    options: [{ value: 'OTH', label: 'OTH — Others' }],
  },
];

export const FLAT_UNITS = UNIT_GROUPS.flatMap((g) => g.options);

export const GST_RATE_OPTIONS = VALID_GST_RATES.map((r) => ({
  value: r,
  label: r === 0 ? '0% — Exempt' : `${r}%`,
}));

// ── Zod schema ────────────────────────────────────────────────────────────────

const UNIT_VALUES = FLAT_UNITS.map((u) => u.value);

export const ProductFormSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .trim()
    .min(2,   'At least 2 characters')
    .max(200, 'Max 200 characters'),

  type: z.enum(['goods', 'service'], { required_error: 'Type is required' }),

  hsnSacCode: z
    .string().trim()
    .regex(/^\d{4,8}$/, 'Must be 4 to 8 digits (e.g. 9983)')
    .optional().or(z.literal('')),

  price: z.coerce
    .number({ required_error: 'Price is required', invalid_type_error: 'Must be a number' })
    .min(0, 'Cannot be negative'),

  unit: z.enum(UNIT_VALUES, { required_error: 'Unit is required' }),

  gstRate: z.coerce
    .number({ required_error: 'GST rate is required' })
    .refine((v) => VALID_GST_RATES.includes(v), { message: 'Invalid GST rate' }),

  taxIncluded: z.boolean().default(false),

  inventoryEnabled: z.boolean().default(false),

  stockQuantity: z.coerce
    .number().int('Must be a whole number').min(0, 'Cannot be negative').default(0),

  lowStockThreshold: z.coerce
    .number().int('Must be a whole number').min(0, 'Cannot be negative').default(10),

  description: z.string().trim().max(1000, 'Max 1000 characters').optional().or(z.literal('')),

  isActive: z.boolean().default(true),
})
  .refine(
    (d) => !(d.type === 'service' && d.inventoryEnabled),
    { message: 'Services cannot have inventory tracking', path: ['inventoryEnabled'] },
  );

/** @typedef {z.infer<typeof ProductFormSchema>} ProductFormValues */
