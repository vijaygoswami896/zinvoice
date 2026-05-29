"use strict";
// import { z } from 'zod';
// const emailField = z
//     .string({ required_error: 'Email is required' })
//     .email('Please provide a valid email address')
//     .toLowerCase()
//     .trim();
// const passwordField = z
//     .string({ required_error: 'Password is required' })
//     .min(8, 'Password must be at least 8 characters')
//     .max(72, 'Password cannot exceed 72 characters')
//     .regex(
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
//         'Password must contain at least one uppercase letter, one lowercase letter, and one number',
//     );
// const nameField = z
//     .string({ required_error: 'Name is required' })
//     .min(2, 'Name must be at least 2 characters')
//     .max(100, 'Name cannot exceed 100 characters')
//     .trim();
// // export const RegisterSchema = z.object({
// //     name: nameField,
// //     email: emailField,
// //     password: passwordField,
// //     role: z.enum(['admin', 'staff']).optional().default('staff'),
// // });
// export const LoginSchema = z.object({
//     email: emailField,
//     password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
// });
// // ── Signup — public, creates owner + business ─────────────────────────────────
// export const SignupSchema = z.object({
//     // Owner details
//     name: z.string().trim().min(2).max(100),
//     email: z.string().email().toLowerCase().trim(),
//     password: z.string().min(8, 'Password must be at least 8 characters'),
//     // Business details
//     businessName: z.string().trim().min(2).max(150),
//     businessEmail: z.string().email().toLowerCase().trim().optional(),
//     businessPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number').optional(),
//     businessGstin: z
//         .string().trim().toUpperCase()
//         .regex(
//             /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
//             'Invalid GSTIN format',
//         )
//         .optional(),
// });
// // ── Invite — admin only, creates staff account ────────────────────────────────
// export const InviteSchema = z.object({
//     name: z.string().trim().min(2).max(100),
//     email: z.string().email().toLowerCase().trim(),
//     password: z.string().min(8, 'Password must be at least 8 characters'),
//     role: z.enum(['staff', 'manager']), // admin cannot invite another admin
// });
// export const RegisterSchema = SignupSchema; // keep existing alias if used elsewhere
// export type RegisterInput = z.infer<typeof RegisterSchema>;
// export type LoginInput = z.infer<typeof LoginSchema>;
// export type SignupBody = z.infer<typeof SignupSchema>;
// export type InviteBody = z.infer<typeof InviteSchema>;
//# sourceMappingURL=auth.schema%20copy.js.map