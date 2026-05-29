import mongoose, { Document, Model } from 'mongoose';
import { IndianState } from '../constants/india.js';
export type GstType = 'B2B' | 'B2C' | 'export';
export interface IAddress {
    line1?: string;
    line2?: string;
    city?: string;
    state?: IndianState;
    pincode?: string;
    country?: string;
}
export interface ICustomer extends Document {
    businessId: mongoose.Types.ObjectId;
    name: string;
    gstin?: string;
    gstType: GstType;
    stateCode?: string;
    email?: string;
    phone?: string;
    billingAddress: IAddress;
    shippingAddress: IAddress;
    sameAsShipping: boolean;
    notes?: string;
    deletedAt: Date | null;
    deletedBy: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Customer: Model<ICustomer>;
