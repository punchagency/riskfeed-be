import { Schema, model, Document } from "mongoose";

export const USER_STATUSES = ['pending', 'active', 'suspended'] as const;
export const ROLES = ['admin', 'user', 'contractor'] as const;
export const PROPERTY_TYPES = ['single_home', 'condo', 'multi_family', 'commercial'] as const;
export const OWNERSHIP_TYPES = ['owner', 'renter', 'lessee'] as const;
export const HEARD_ABOUT_SOURCES = ['online_search', 'google_search', 'friend_family_referral', 'contractor_referral', 'social_media', 'ad', 'other',] as const;

export interface IUserAddress {
    street: string;
    zipcode: string;
    city: string;
    state: string;
    country: string;
}

export interface IUserProperty {
    type: typeof PROPERTY_TYPES[number];
    name?: string;
    address: IUserAddress;
    ownershipType?: typeof OWNERSHIP_TYPES[number];
    notes?: string;
}

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    profilePicture?: string;
    email: string;
    phoneNumber: string;
    address: IUserAddress;
    refreshToken: string;
    activationCode?: string;
    activationCodeExpires?: Date;
    resetPasswordCode?: string;
    resetPasswordCodeExpires?: Date;
    notificationPreferences: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        marketingCommunications: boolean;
    };
    password: string;
    status: typeof USER_STATUSES[number];
    role: typeof ROLES[number];
    ownershipType?: typeof OWNERSHIP_TYPES[number];
    properties?: IUserProperty[];
    heardAboutRiskfeed?: {
        source: typeof HEARD_ABOUT_SOURCES[number];
        otherDetails?: string;
    };
}

const AddressSchema = new Schema<IUserAddress>(
    {
        street: { type: String, required: true },
        zipcode: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
    },
    { _id: false }
);

const PropertySchema = new Schema<IUserProperty>(
    {
        type: { type: String, enum: PROPERTY_TYPES, required: true },
        name: { type: String },
        address: { type: AddressSchema, required: true },
        ownershipType: { type: String, enum: OWNERSHIP_TYPES },
        notes: { type: String },
    },
    { _id: true, timestamps: false }
);

const UserSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        profilePicture: { type: String },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true, unique: true },
        address: { type: AddressSchema, required: true },
        refreshToken: { type: String },
        activationCode: { type: String },
        activationCodeExpires: { type: Date },
        resetPasswordCode: { type: String },
        resetPasswordCodeExpires: { type: Date },
        notificationPreferences: {
            emailNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
            marketingCommunications: { type: Boolean, default: true },
        },
        password: { type: String, required: true },
        status: { type: String, enum: USER_STATUSES, default: 'pending' },
        role: { type: String, enum: ROLES, default: 'user', index: true },
        ownershipType: { type: String, enum: OWNERSHIP_TYPES },
        properties: { type: [PropertySchema], default: [] },
        heardAboutRiskfeed: {
            source: { type: String, enum: HEARD_ABOUT_SOURCES },
            otherDetails: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.index({ phone: 1 });

export default model<IUser>('User', UserSchema);