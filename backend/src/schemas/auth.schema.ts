import { z } from 'zod';

const emailField = z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim();

const passwordField = z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    );

const nameField = z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim();

export const RegisterSchema = z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
    role: z.enum(['admin', 'staff']).optional().default('staff'),
});

export const LoginSchema = z.object({
    email: emailField,
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// 'use strict';

// const { z } = require('zod');

// // ── Reusable field definitions ────────────────────────────────────────────────

// const emailField = z
//     .string({ required_error: 'Email is required' })
//     .email('Please provide a valid email address')
//     .toLowerCase()
//     .trim();

// const passwordField = z
//     .string({ required_error: 'Password is required' })
//     .min(8, 'Password must be at least 8 characters')
//     .max(72, 'Password cannot exceed 72 characters') // bcrypt hard limit
//     .regex(
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
//         'Password must contain at least one uppercase letter, one lowercase letter, and one number',
//     );

// const nameField = z
//     .string({ required_error: 'Name is required' })
//     .min(2, 'Name must be at least 2 characters')
//     .max(100, 'Name cannot exceed 100 characters')
//     .trim();

// // ── Auth schemas ──────────────────────────────────────────────────────────────

// /**
//  * POST /api/v1/auth/register
//  */
// const RegisterSchema = z.object({
//     name: nameField,
//     email: emailField,
//     password: passwordField,
//     role: z.enum(['admin', 'staff']).optional().default('staff'),
// });

// /**
//  * POST /api/v1/auth/login
//  */
// const LoginSchema = z.object({
//     email: emailField,
//     password: z
//         .string({ required_error: 'Password is required' })
//         .min(1, 'Password is required'),
// });

// module.exports = { RegisterSchema, LoginSchema };