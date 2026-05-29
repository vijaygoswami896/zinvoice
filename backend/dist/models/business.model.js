import mongoose, { Schema } from 'mongoose';
const businessSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        maxlength: [150, 'Max 150 characters'],
    },
    // gstin: {
    //     type: String,
    //     trim: true,
    //     uppercase: true,
    //     match: [
    //         /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    //         'Invalid GSTIN format',
    //     ],
    // },
    // email: {
    //     type: String,
    //     trim: true,
    //     lowercase: true,
    // },
    // phone: {
    //     type: String,
    //     trim: true,
    // },
    // address: {
    //     type: String,
    //     trim: true,
    // },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
businessSchema.index({ owner: 1 });
export const Business = mongoose.model('Business', businessSchema);
//# sourceMappingURL=business.model.js.map