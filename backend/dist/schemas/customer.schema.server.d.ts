import { z } from 'zod';
declare const CustomerBodySchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    gstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gstType: z.ZodEffects<z.ZodType<"B2B" | "B2C" | "export", z.ZodTypeDef, "B2B" | "B2C" | "export">, "B2B" | "B2C" | "export", unknown>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        line1: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        line2: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        city: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        state: z.ZodOptional<z.ZodEnum<["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"]>>;
        pincode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        country: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    }, {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    }>>;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        line1: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        line2: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        city: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        state: z.ZodOptional<z.ZodEnum<["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"]>>;
        pincode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        country: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    }, {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    }>>;
    sameAsShipping: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    gstType: "B2B" | "B2C" | "export";
    sameAsShipping: boolean;
    email?: string | undefined;
    gstin?: string | undefined;
    phone?: string | undefined;
    billingAddress?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    shippingAddress?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    notes?: string | undefined;
}, {
    name: string;
    email?: string | undefined;
    gstin?: string | undefined;
    phone?: string | undefined;
    gstType?: unknown;
    billingAddress?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    shippingAddress?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    sameAsShipping?: boolean | undefined;
    notes?: string | undefined;
}>, {
    name: string;
    gstType: "B2B" | "B2C" | "export";
    sameAsShipping: boolean;
    email?: string | undefined;
    gstin?: string | undefined;
    phone?: string | undefined;
    billingAddress?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    shippingAddress?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    notes?: string | undefined;
}, {
    name: string;
    email?: string | undefined;
    gstin?: string | undefined;
    phone?: string | undefined;
    gstType?: unknown;
    billingAddress?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    shippingAddress?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    sameAsShipping?: boolean | undefined;
    notes?: string | undefined;
}>;
declare const CustomerListQuerySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    search: z.ZodOptional<z.ZodString>;
    gstType: z.ZodEffects<z.ZodOptional<z.ZodEnum<["B2B", "B2C", "export"]>>, "B2B" | "B2C" | "export" | undefined, unknown>;
    state: z.ZodEffects<z.ZodOptional<z.ZodEnum<["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"]>>, "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined, unknown>;
    sortBy: z.ZodEffects<z.ZodType<"createdAt" | "name" | "updatedAt", z.ZodTypeDef, "createdAt" | "name" | "updatedAt">, "createdAt" | "name" | "updatedAt", unknown>;
    sortDir: z.ZodEffects<z.ZodType<"asc" | "desc", z.ZodTypeDef, "asc" | "desc">, "asc" | "desc", unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "name" | "updatedAt";
    sortDir: "asc" | "desc";
    search?: string | undefined;
    state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
    gstType?: "B2B" | "B2C" | "export" | undefined;
}, {
    page?: unknown;
    limit?: unknown;
    search?: string | undefined;
    state?: unknown;
    gstType?: unknown;
    sortBy?: unknown;
    sortDir?: unknown;
}>;
declare const CustomerIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type CustomerBody = z.infer<typeof CustomerBodySchema>;
export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>;
export type CustomerIdParam = z.infer<typeof CustomerIdParamSchema>;
export { CustomerBodySchema, CustomerListQuerySchema, CustomerIdParamSchema };
export type { AddressInput as Address } from './shared.schema';
