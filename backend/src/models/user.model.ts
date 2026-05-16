import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = Object.freeze({
    ADMIN: 'admin',
    STAFF: 'staff',
} as const);

type Role = typeof ROLES[keyof typeof ROLES];

const BCRYPT_SALT_ROUNDS = 12;

// ── Interfaces ────────────────────────────────────────────────────────────────

interface IRefreshToken {
    token: string;
    tokenHash: string;
    userAgent: string;
    ip: string;
    expiresAt: Date;
    createdAt: Date;
}

interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    businesses: mongoose.Types.ObjectId[];
    refreshTokens: IRefreshToken[];
    isActive: boolean;
    lastLoginAt: Date | null;
    deletedAt: Date | null;
    comparePassword(plaintext: string): Promise<boolean>;
    pruneRefreshTokens(): void;
    removeExpiredTokens(): void;
}

interface IUserModel extends Model<IUser> {
    findByEmailWithPassword(email: string): ReturnType<Model<IUser>['findOne']>;
}

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        token: { type: String, required: true },
        tokenHash: { type: String, required: true, select: false },
        userAgent: { type: String, default: '' },
        ip: { type: String, default: '' },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true },
);

// ── User schema ───────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser, IUserModel>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
            select: false,
        },
        role: {
            type: String,
            enum: { values: Object.values(ROLES), message: `Role must be one of: ${Object.values(ROLES).join(', ')}` },
            default: ROLES.STAFF,
        },
        businesses: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
        refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date, default: null },
        deletedAt: { type: Date, default: null, select: false },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                delete ret.passwordHash;
                delete ret.refreshTokens;
                delete ret.deletedAt;
                delete ret.__v;
                return ret;
            },
        },
    },
);

// ── Indexes ───────────────────────────────────────────────────────────────────

userSchema.index({ email: 1, deletedAt: 1 });
userSchema.index({ 'refreshTokens.token': 1 });

// ── Hooks ─────────────────────────────────────────────────────────────────────

userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, BCRYPT_SALT_ROUNDS);
    next();
});

// ── Instance methods ──────────────────────────────────────────────────────────

userSchema.methods.comparePassword = function (plaintext: string): Promise<boolean> {
    return bcrypt.compare(plaintext, this.passwordHash);
};

userSchema.methods.pruneRefreshTokens = function (): void {
    if (this.refreshTokens.length > 5) {
        this.refreshTokens = (this.refreshTokens as IRefreshToken[])
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);
    }
};

userSchema.methods.removeExpiredTokens = function (): void {
    const now = new Date();
    this.refreshTokens = (this.refreshTokens as IRefreshToken[]).filter((t) => t.expiresAt > now);
};

// ── Statics ───────────────────────────────────────────────────────────────────

userSchema.statics.findByEmailWithPassword = function (email: string) {
    return this.findOne({ email: email.toLowerCase().trim(), deletedAt: null })
        .select('+passwordHash +refreshTokens');
};

// ── Model ─────────────────────────────────────────────────────────────────────

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export { User, ROLES };
export type { IUser, IRefreshToken, Role };



// 'use strict';

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const ROLES = Object.freeze({
//     ADMIN: 'admin',
//     STAFF: 'staff',
// });

// const BCRYPT_SALT_ROUNDS = 12;

// // ── Refresh token sub-document ────────────────────────────────────────────────
// const refreshTokenSchema = new mongoose.Schema(
//     {
//         token: {
//             type: String,
//             required: true,
//         },
//         // Store hash only — same as passwords, never store raw tokens
//         tokenHash: {
//             type: String,
//             required: true,
//             select: false,
//         },
//         userAgent: { type: String, default: '' },
//         ip: { type: String, default: '' },
//         expiresAt: {
//             type: Date,
//             required: true,
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now,
//         },
//     },
//     { _id: true },
// );

// // ── User schema ───────────────────────────────────────────────────────────────
// const userSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: [true, 'Name is required'],
//             trim: true,
//             maxlength: [100, 'Name cannot exceed 100 characters'],
//         },

//         email: {
//             type: String,
//             required: [true, 'Email is required'],
//             unique: true,
//             lowercase: true,
//             trim: true,
//             match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
//         },

//         passwordHash: {
//             type: String,
//             required: [true, 'Password is required'],
//             // minlength: 60, // bcrypt output length
//             select: false,  // Never returned in queries by default
//         },

//         role: {
//             type: String,
//             enum: {
//                 values: Object.values(ROLES),
//                 message: `Role must be one of: ${Object.values(ROLES).join(', ')}`,
//             },
//             default: ROLES.STAFF,
//         },

//         // Which businesses this user can access (multi-business SaaS)
//         businesses: [
//             {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'Business',
//             },
//         ],

//         // Active refresh tokens — supports multi-device login
//         // Capped at 5 to prevent unbounded growth
//         refreshTokens: {
//             type: [refreshTokenSchema],
//             default: [],
//             select: false,
//         },

//         isActive: {
//             type: Boolean,
//             default: true,
//         },

//         lastLoginAt: {
//             type: Date,
//             default: null,
//         },

//         // Soft delete
//         deletedAt: {
//             type: Date,
//             default: null,
//             select: false,
//         },
//     },
//     {
//         timestamps: true, // createdAt, updatedAt
//         toJSON: {
//             transform(_doc, ret) {
//                 delete ret.passwordHash;
//                 delete ret.refreshTokens;
//                 delete ret.deletedAt;
//                 delete ret.__v;
//                 return ret;
//             },
//         },
//     },
// );

// // ── Indexes ───────────────────────────────────────────────────────────────────
// userSchema.index({ email: 1, deletedAt: 1 });
// userSchema.index({ 'refreshTokens.token': 1 });

// // ── Pre-save: hash password if modified ──────────────────────────────────────
// userSchema.pre('save', async function hashPassword(next) {
//     if (!this.isModified('passwordHash')) return next();
//     // At this point passwordHash holds the plaintext — hash it
//     this.passwordHash = await bcrypt.hash(this.passwordHash, BCRYPT_SALT_ROUNDS);
//     next();
// });

// // ── Instance methods ──────────────────────────────────────────────────────────

// /**
//  * Compares a plaintext password against the stored hash.
//  * Requires passwordHash to be explicitly selected in the query.
//  */
// userSchema.methods.comparePassword = async function comparePassword(plaintext) {
//     return bcrypt.compare(plaintext, this.passwordHash);
// };

// /**
//  * Trims refresh tokens list to the 5 most recent.
//  * Prevents unbounded subdocument growth.
//  */
// userSchema.methods.pruneRefreshTokens = function pruneRefreshTokens() {
//     if (this.refreshTokens.length > 5) {
//         this.refreshTokens = this.refreshTokens
//             .sort((a, b) => b.createdAt - a.createdAt)
//             .slice(0, 5);
//     }
// };

// /**
//  * Removes all expired refresh tokens from the subdocument array.
//  */
// userSchema.methods.removeExpiredTokens = function removeExpiredTokens() {
//     const now = new Date();
//     this.refreshTokens = this.refreshTokens.filter((t) => t.expiresAt > now);
// };

// // ── Static helpers ────────────────────────────────────────────────────────────

// /**
//  * Finds an active (non-deleted) user by email, explicitly selecting
//  * the passwordHash field which is excluded by default.
//  */
// userSchema.statics.findByEmailWithPassword = function findByEmailWithPassword(email) {
//     return this.findOne({ email: email.toLowerCase().trim(), deletedAt: null })
//         .select('+passwordHash +refreshTokens');
// };

// // ── Model export ──────────────────────────────────────────────────────────────
// const User = mongoose.model('User', userSchema);

// module.exports = { User, ROLES };