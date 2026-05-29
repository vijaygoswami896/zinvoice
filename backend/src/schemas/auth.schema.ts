import { z } from 'zod';
import {
    nameField,
    emailField,
    passwordField,
    gstinField,
    indianMobileField,
    BusinessBaseSchema,
} from './shared.schema.js';

export const LoginSchema = z.object({
    email: emailField,
    password: z.string({ required_error: 'Password is required' }).min(1),
});

export const SignupSchema = z.object({
    // Owner
    name: nameField,
    email: emailField,
    password: passwordField,

    // Business — reuses same validators as settings
    // businessName: z.string().trim().min(2).max(150),
    // businessEmail: emailField.optional(),
    // businessPhone: indianMobileField,
    // businessGstin: gstinField,
}).merge(BusinessBaseSchema);;

export const InviteSchema = z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
    role: z.enum(['staff', 'manager']),
});

export const RegisterSchema = SignupSchema;

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupBody = z.infer<typeof SignupSchema>;
export type InviteBody = z.infer<typeof InviteSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;