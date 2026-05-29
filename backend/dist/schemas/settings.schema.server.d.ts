import { z } from 'zod';
export declare const UpdateSettingsSchema: z.ZodObject<{
    businessName: z.ZodString;
    businessEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    businessPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    businessGstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gstRegistrationType: z.ZodEnum<["regular", "composition", "unregistered"]>;
    legalName: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    pan: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    address: z.ZodOptional<z.ZodObject<{
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
    bankDetails: z.ZodOptional<z.ZodObject<{
        bankName: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        accountName: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        accountNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        ifscCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        branch: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        upiId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        bankName?: string | undefined;
        accountName?: string | undefined;
        accountNumber?: string | undefined;
        ifscCode?: string | undefined;
        branch?: string | undefined;
        upiId?: string | undefined;
    }, {
        bankName?: string | undefined;
        accountName?: string | undefined;
        accountNumber?: string | undefined;
        ifscCode?: string | undefined;
        branch?: string | undefined;
        upiId?: string | undefined;
    }>>;
    invoicePrefix: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    invoiceNotes: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    invoiceTerms: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
} & {
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    defaultDueDays: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    businessName: string;
    gstRegistrationType: "regular" | "composition" | "unregistered";
    businessEmail?: string | undefined;
    businessPhone?: string | undefined;
    businessGstin?: string | undefined;
    legalName?: string | undefined;
    pan?: string | undefined;
    address?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    bankDetails?: {
        bankName?: string | undefined;
        accountName?: string | undefined;
        accountNumber?: string | undefined;
        ifscCode?: string | undefined;
        branch?: string | undefined;
        upiId?: string | undefined;
    } | undefined;
    invoicePrefix?: string | undefined;
    invoiceNotes?: string | undefined;
    invoiceTerms?: string | undefined;
    defaultDueDays?: number | undefined;
    website?: string | undefined;
}, {
    businessName: string;
    gstRegistrationType: "regular" | "composition" | "unregistered";
    businessEmail?: string | undefined;
    businessPhone?: string | undefined;
    businessGstin?: string | undefined;
    legalName?: string | undefined;
    pan?: string | undefined;
    address?: {
        line1?: string | undefined;
        line2?: string | undefined;
        city?: string | undefined;
        state?: "Andhra Pradesh" | "Arunachal Pradesh" | "Assam" | "Bihar" | "Chhattisgarh" | "Goa" | "Gujarat" | "Haryana" | "Himachal Pradesh" | "Jharkhand" | "Karnataka" | "Kerala" | "Madhya Pradesh" | "Maharashtra" | "Manipur" | "Meghalaya" | "Mizoram" | "Nagaland" | "Odisha" | "Punjab" | "Rajasthan" | "Sikkim" | "Tamil Nadu" | "Telangana" | "Tripura" | "Uttar Pradesh" | "Uttarakhand" | "West Bengal" | "Andaman and Nicobar Islands" | "Chandigarh" | "Dadra and Nagar Haveli and Daman and Diu" | "Delhi" | "Jammu and Kashmir" | "Ladakh" | "Lakshadweep" | "Puducherry" | undefined;
        pincode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    bankDetails?: {
        bankName?: string | undefined;
        accountName?: string | undefined;
        accountNumber?: string | undefined;
        ifscCode?: string | undefined;
        branch?: string | undefined;
        upiId?: string | undefined;
    } | undefined;
    invoicePrefix?: string | undefined;
    invoiceNotes?: string | undefined;
    invoiceTerms?: string | undefined;
    defaultDueDays?: number | undefined;
    website?: string | undefined;
}>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
export type { AddressInput, BankDetailsInput } from './shared.schema';
