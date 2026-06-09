import { z } from 'zod';
import { BusinessBaseSchema, emailField, nameField, passwordField } from './shared.schema';

export const LoginSchema = z.object({
    email: emailField,
    password: z.string({ error: 'Password is required' }).min(1),
});

export const SignupSchema = z.object({
    // Owner
    name: nameField,
    email: emailField,
    password: passwordField,
    confirmPassword: z.string({ error: 'Please confirm your password' }),
    ...BusinessBaseSchema.shape
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const InviteSchema = z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
    role: z.enum(['staff', 'manager']),
});

export const RegisterSchema = SignupSchema;

export const ForgotPasswordSchema = z.object({
    email: emailField,
});

// export const ResetPasswordSchema = z.object({
//     email: emailField,
//     otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
//     newPassword: passwordField,
// });

export const ResetPasswordSchema = z.object({
    otp: z
        .string()
        .min(1, 'OTP is required')
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d+$/, 'OTP must contain only digits'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});