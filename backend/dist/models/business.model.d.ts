import mongoose, { Document, Model } from 'mongoose';
export interface IBusiness extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    owner: mongoose.Types.ObjectId;
    isActive: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Business: Model<IBusiness>;
