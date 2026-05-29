import mongoose, { Document, Model, Types } from 'mongoose';
import { INDIAN_STATE_CODES, INDIAN_STATES } from '../constants/india.js';
interface IAddress {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}
interface IBankDetails {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
    upiId?: string;
}
interface IUploadedFile {
    url: string;
    originalName?: string;
    mimetype?: string;
    size?: number;
    uploadedAt?: Date;
}
interface ISettings extends Document {
    _id: Types.ObjectId;
    businessId: mongoose.Types.ObjectId;
    businessName: string;
    legalName?: string;
    gstin?: string;
    pan?: string;
    registrationDate?: Date;
    gstRegistrationType?: 'regular' | 'composition' | 'unregistered';
    email?: string;
    phone?: string;
    website?: string;
    address?: IAddress;
    stateCode?: string;
    bankDetails?: IBankDetails;
    invoicePrefix?: string;
    invoiceNotes?: string;
    invoiceTerms?: string;
    defaultDueDays?: number;
    logo?: IUploadedFile | null;
    signature?: IUploadedFile | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const Settings: Model<ISettings>;
export { Settings, INDIAN_STATES, INDIAN_STATE_CODES };
export type { ISettings, IAddress, IBankDetails, IUploadedFile };
