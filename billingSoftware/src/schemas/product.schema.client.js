import { UNIT_VALUES, GST_RATES } from '@/constants';
import { z } from 'zod';

export const ProductFormSchema = z.object({
  name: z.string({ error: 'Product name is required' }),

  type: z.enum(['goods', 'service'], { error: 'Type is required' }),

  hsnSacCode: z
    .string().trim()
    .regex(/^\d{4,8}$/, 'Must be 4 to 8 digits (e.g. 9983)')
    .optional().or(z.literal('')),

  price: z.coerce.number({ error: 'Price is required' }).min(0, 'Cannot be negative'),

  unit: z.enum(UNIT_VALUES, { error: 'Unit is required' }),

  gstRate: z.coerce.number({ error: 'GST rate is required' })
    .refine((v) => GST_RATES.includes(v), { error: 'Invalid GST rate' }),

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
    { error: 'Services cannot have inventory tracking', path: ['inventoryEnabled'] },
  )
// .refine(
//   (d) => !(d.type === 'service' && d.inventoryEnabled),
//   { message: 'Services cannot have inventory tracking', path: ['inventoryEnabled'] },
// );
