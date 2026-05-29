import { Types } from 'mongoose';
import { InviteBody, SignupBody } from '../schemas/auth.schema.js';
interface RegisterParams {
    name: string;
    email: string;
    password: string;
    role: string;
}
interface LoginParams {
    email: string;
    password: string;
    userAgent: string;
    ip: string;
}
interface RefreshParams {
    rawToken: string | null;
    userAgent: string;
    ip: string;
}
interface LogoutParams {
    rawToken: string | null;
}
interface SanitisedUser {
    id: Types.ObjectId;
    businesses: Types.ObjectId[];
    name: string;
    email: string;
    role: string;
    lastLoginAt: Date | null;
    createdAt: Date;
}
declare const _default: {
    register: ({ name, email, password, role }: RegisterParams) => Promise<SanitisedUser>;
    signup: ({ name, email, password, businessName, businessEmail, businessPhone, businessGstin, gstRegistrationType }: SignupBody) => Promise<SanitisedUser>;
    invite: (adminBusinessId: string, { name, email, password, role }: InviteBody) => Promise<SanitisedUser>;
    login: ({ email, password, userAgent, ip }: LoginParams) => Promise<{
        accessToken: string;
        rawRefreshToken: string;
        user: SanitisedUser;
    }>;
    refresh: ({ rawToken, userAgent, ip }: RefreshParams) => Promise<{
        accessToken: string;
        rawRefreshToken: string;
        user: SanitisedUser;
    }>;
    logout: ({ rawToken }: LogoutParams) => Promise<void>;
    logoutAll: (userId: string) => Promise<void>;
};
export default _default;
