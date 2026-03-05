import { Schema, model, Document, Types } from "mongoose";

export const PROPERTIES_TYPES = ['single_family_home', 'townhouse', 'condominium', 'multi-family', 'investment_property', 'vacation_home', 'commercial_property', 'land/lot'] as const;
export const PROPERTY_STATUS = ['active', 'sold', 'archived', 'lease', 'rented'] as const;

export interface IProperties extends Document {
    user: Types.ObjectId;
    name: string;
    propertyType: typeof PROPERTIES_TYPES[number];
    status: typeof PROPERTY_STATUS[number];
    projects?: Types.ObjectId[];
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    purchaseDate?: Date;
    purchasePrice?: number;
    estimatedValue?: number;
    currentEstimatedValue?: number;
    annualPropertyTax?: number;
    annualInsurance?: number;
    annualMaintenanceCosts?: number;
    squareFeet?: number;
    yearBuilt?: number;
    noOfBedrooms?: number;
    noOfBathrooms?: number;
    lotSize?: string;
    notes?: string;
    images?: string[];
}

const PropertiesSchema = new Schema<IProperties>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    propertyType: { type: String, enum: PROPERTIES_TYPES, required: true },
    status: { type: String, enum: PROPERTY_STATUS, default: 'active', index: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project', index: true }],
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number },
    estimatedValue: { type: Number },
    currentEstimatedValue: { type: Number },
    annualPropertyTax: { type: Number },
    annualInsurance: { type: Number },
    annualMaintenanceCosts: { type: Number },
    squareFeet: { type: Number },
    yearBuilt: { type: Number },
    noOfBedrooms: { type: Number },
    noOfBathrooms: { type: Number },
    lotSize: { type: String },
    notes: { type: String },
    images: [{ type: String }]
}, { timestamps: true });

PropertiesSchema.index({ name: 'text' });

export const PropertiesModel = model<IProperties>('Properties', PropertiesSchema);

