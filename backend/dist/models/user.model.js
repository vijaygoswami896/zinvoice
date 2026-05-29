import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const ROLES = Object.freeze({
    ADMIN: 'admin',
    STAFF: 'staff',
});
const BCRYPT_SALT_ROUNDS = 12;
// ── Sub-schemas ───────────────────────────────────────────────────────────────
const refreshTokenSchema = new Schema({
    token: { type: String, required: true },
    tokenHash: { type: String, required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });
// ── User schema ───────────────────────────────────────────────────────────────
const userSchema = new Schema({
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
}, {
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
});
// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1, deletedAt: 1 });
// userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ 'refreshTokens.tokenHash': 1 });
// ── Hooks ─────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash'))
        return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, BCRYPT_SALT_ROUNDS);
    next();
});
// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = function (plaintext) {
    return bcrypt.compare(plaintext, this.passwordHash);
};
userSchema.methods.pruneRefreshTokens = function () {
    if (this.refreshTokens.length > 5) {
        this.refreshTokens = this.refreshTokens
            .sort((a, b) => (b.createdAt ?? new Date(0)).getTime() - (a.createdAt ?? new Date(0)).getTime())
            .slice(0, 5);
    }
};
userSchema.methods.removeExpiredTokens = function () {
    const now = new Date();
    this.refreshTokens = this.refreshTokens.filter((t) => t.tokenHash && t.expiresAt > now);
};
// ── Statics ───────────────────────────────────────────────────────────────────
userSchema.statics.findByEmailWithPassword = async function (email) {
    return this.findOne({ email: email.toLowerCase().trim(), deletedAt: null })
        .select('+passwordHash +refreshTokens')
        .exec();
};
// userSchema.statics.findByEmailWithPassword = function (email: string) {
//     return this.findOne({ email: email.toLowerCase().trim(), deletedAt: null })
//         .select('+passwordHash +refreshTokens') as unknown as Promise<IUser | null>;;
// };
// ── Model ─────────────────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);
export { User, ROLES };
//# sourceMappingURL=user.model.js.map