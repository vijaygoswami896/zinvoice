import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const SignupSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
} & {
    businessName: z.ZodString;
    businessEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    businessPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    businessGstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gstRegistrationType: z.ZodEnum<["regular", "composition", "unregistered"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    businessName: string;
    gstRegistrationType: "regular" | "composition" | "unregistered";
    password: string;
    businessEmail?: string | undefined;
    businessPhone?: string | undefined;
    businessGstin?: string | undefined;
}, {
    name: string;
    email: string;
    businessName: string;
    gstRegistrationType: "regular" | "composition" | "unregistered";
    password: string;
    businessEmail?: string | undefined;
    businessPhone?: string | undefined;
    businessGstin?: string | undefined;
}>;
export declare const InviteSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["staff", "manager"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role: "staff" | "manager";
    password: string;
}, {
    name: string;
    email: string;
    role: "staff" | "manager";
    password: string;
}>;
export declare const RegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
} & {
    businessName: z.ZodString;
    businessEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    businessPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    businessGstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gstRegistrationType: z.ZodEnum<["regular", "composition", "unregistered"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    businessName: string;
    gstRegistrationType: "regular" | "composition" | "unregistered";
    password: string;
    businessEmail?: string | undefined;
    businessPhone?: string | undefined;
    businessGstin?: string | undefined;
}, {
    name: string;
    email: string;
    businessName: string;
    gstRegistrationType: "regular" | "composition" | "unregistered";
    password: string;
    businessEmail?: string | undefined;
    businessPhone?: string | undefined;
    businessGstin?: string | undefined;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupBody = z.infer<typeof SignupSchema>;
export type InviteBody = z.infer<typeof InviteSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
