import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBusiness extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    // gstin?: string;
    // email?: string;
    // phone?: string;
    // address?: string;
    owner: mongoose.Types.ObjectId;
    isActive: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
    {
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
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                const { __v, ...rest } = ret;
                return rest;

                // delete ret.__v;
                // return ret;
            },
        },
    },
);

businessSchema.index({ owner: 1 });

export const Business: Model<IBusiness> =
    mongoose.model<IBusiness>('Business', businessSchema);