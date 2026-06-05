import { z } from 'zod';
import {
  BusinessSchema,
} from './shared.schema.js';

export const UpdateSettingsSchema = BusinessSchema.extend({
  // settings-only fields like website, phone (as non-business phone)
  website: z.string().trim().max(200).optional().or(z.literal('')),
  defaultDueDays: z.coerce.number().int().min(0).max(365).default(30).optional(),
  invoiceTemplate: z.enum(['classic', 'modern']).optional(),
  showGstBreakdown: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

// Re-export shared types so importers don't need two imports
export type { AddressInput, BankDetailsInput } from './shared.schema';