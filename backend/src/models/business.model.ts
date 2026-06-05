import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBusiness extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
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