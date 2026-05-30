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