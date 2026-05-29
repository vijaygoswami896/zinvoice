import mongoose, { Document, Model } from 'mongoose';
declare const ROLES: Readonly<{
    readonly ADMIN: "admin";
    readonly STAFF: "staff";
}>;
type Role = typeof ROLES[keyof typeof ROLES];
interface IRefreshToken {
    token: string;
    tokenHash: string;
    userAgent: string;
    ip: string;
    expiresAt: Date;
    createdAt?: Date;
}
interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    businesses: mongoose.Types.ObjectId[];
    refreshTokens: IRefreshToken[];
    isActive: boolean;
    lastLoginAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(plaintext: string): Promise<boolean>;
    pruneRefreshTokens(): void;
    removeExpiredTokens(): void;
}
interface IUserModel extends Model<IUser> {
    findByEmailWithPassword(email: string): Promise<IUser | null>;
}
declare const User: IUserModel;
export { User, ROLES };
export type { IUser, IRefreshToken, Role };
