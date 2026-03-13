import { Schema, model, Document, Types } from "mongoose";
import { PROJECT_TYPES } from "./project.model";


export const VERIFICATION_STATUSES = ['not_started', 'in_progress', 'verified', 'failed',] as const;
export const TEAM_SIZE_BUCKETS = ['solo', 'one_to_five', 'six_to_ten', 'eleven_to_twenty-five', 'twenty-five_to_fifty', 'fifty_plus'] as const;
export const CONTRACTOR_STATUSES = ['pending', 'active', 'suspended', 'deleted'] as const;
export const CERTIFICATE_STATUSES = ['under review', 'verified', 'expired'] as const;
export const CORPORATION_TYPES = ['sole_proprietorship', 'partnership', 'limited_liability_company', 'corporation', 'other'] as const;


export interface IContractorLicense {
    number: string;
    description: string;
    state: string;
}

export interface IBusinessAddress {
    street: string;
    zipcode: string;
    city: string;
    state: string;
    country: string;
}

export interface IContractorReview {
    rating: number;
    comment: string;
    reviewer: Schema.Types.ObjectId;
    date: Date;
}

export interface IContractorRatings {
    averageRatings: number;
    totalRatings: number;
    reviews: IContractorReview[];
    totalReviews: number;
}

export interface IContractorCertification {
    name: string;
    issuingOrganization: string;
    status: typeof CERTIFICATE_STATUSES[number];
    attachments: string[];
    issueDate: Date;
    expirationDate: Date;
}

export interface IContractorPortfolioItem {
    projectTitle: string;
    description: string;
    link?: string;
    images?: string[];
    completionDate?: Date;
}

export interface IContractorInsurance {
    provider: string;
    policyNumber: string;
    coverageDetails?: string;
    expiryDate?: Date;
}

export interface IContractorVerification {
    businessVerificationStatus: typeof VERIFICATION_STATUSES[number];
    licenseValidationStatus: typeof VERIFICATION_STATUSES[number];
    insuranceCheckStatus: typeof VERIFICATION_STATUSES[number];
    backgroundScreeningStatus: typeof VERIFICATION_STATUSES[number];
    financialHealthStatus: typeof VERIFICATION_STATUSES[number];
    lastVerifiedAt?: Date;
}

export interface IContractor extends Document {
    user: Types.ObjectId;
    companyName: string;
    businessName?: string;
    companyLogo?: string;
    licenses: IContractorLicense[];
    corporationType: typeof CORPORATION_TYPES[number];
    yearEstablished: number;
    taxId: string;
    businessEmail: string;
    businessPhone: string;
    businessWebsite?: string;
    businessAddresses: IBusinessAddress[];
    services: typeof PROJECT_TYPES[number][];
    serviceAreas: string[];
    teamSize?: typeof TEAM_SIZE_BUCKETS[number];
    isBonded?: boolean;
    insurance?: IContractorInsurance;
    verification: IContractorVerification;
    hourlyRate?: number;
    ratings?: IContractorRatings;
    certifications: IContractorCertification[];
    portfolio: IContractorPortfolioItem[];
    savedProjects: Schema.Types.ObjectId[];
    riskScore: number;
    activeProjects: number;
    completedProjects: number;
    averageBudget: number;
}

const ContractorLicenseSchema = new Schema<IContractorLicense>(
    {
        number: { type: String, required: true },
        description: { type: String, required: true },
        state: { type: String, required: true },
    },
    { _id: true }
);

const BusinessAddressSchema = new Schema<IBusinessAddress>(
    {
        street: { type: String, required: true },
        zipcode: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
    },
    { _id: true }
);

const ContractorReviewSchema = new Schema<IContractorReview>(
    {
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, default: Date.now },
    },
    { _id: true }
);

const ContractorRatingsSchema = new Schema<IContractorRatings>(
    {
        averageRatings: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
        reviews: { type: [ContractorReviewSchema], default: [] },
        totalReviews: { type: Number, default: 0 },
    },
    { _id: false }
);

const ContractorCertificationSchema = new Schema<IContractorCertification>(
    {
        name: { type: String, required: true },
        issuingOrganization: { type: String, required: true },
        status: { type: String, enum: CERTIFICATE_STATUSES, default: 'under review' },
        attachments: { type: [String], default: [] },
        issueDate: { type: Date, required: true },
        expirationDate: { type: Date },
    },
    { _id: true }
);

const ContractorPortfolioSchema = new Schema<IContractorPortfolioItem>(
    {
        projectTitle: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String },
        images: { type: [String], default: [] },
        completionDate: { type: Date },
    },
    { _id: true }
);

const ContractorInsuranceSchema = new Schema<IContractorInsurance>(
    {
        provider: { type: String, required: true },
        policyNumber: { type: String, required: true },
        coverageDetails: { type: String },
        expiryDate: { type: Date },
    },
    { _id: false }
);

const ContractorVerificationSchema = new Schema<IContractorVerification>(
    {
        businessVerificationStatus: { type: String, enum: VERIFICATION_STATUSES, default: 'not_started' },
        licenseValidationStatus: { type: String, enum: VERIFICATION_STATUSES, default: 'not_started' },
        insuranceCheckStatus: { type: String, enum: VERIFICATION_STATUSES, default: 'not_started' },
        backgroundScreeningStatus: { type: String, enum: VERIFICATION_STATUSES, default: 'not_started' },
        financialHealthStatus: { type: String, enum: VERIFICATION_STATUSES, default: 'not_started' },
        lastVerifiedAt: { type: Date },
    },
    { _id: false }
);

const ContractorSchema = new Schema<IContractor>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        companyName: { type: String },
        businessName: { type: String },
        companyLogo: { type: String },
        licenses: { type: [ContractorLicenseSchema], default: [] },
        corporationType: { type: String, enum: CORPORATION_TYPES },
        yearEstablished: { type: Number },
        taxId: { type: String },
        businessEmail: { type: String },
        businessPhone: { type: String },
        businessWebsite: { type: String },
        businessAddresses: { type: [BusinessAddressSchema], default: [] },
        services: { type: [String], enum: PROJECT_TYPES, default: [] },
        serviceAreas: { type: [String], default: [] },
        teamSize: { type: String, enum: TEAM_SIZE_BUCKETS },
        isBonded: { type: Boolean, default: false },
        insurance: { type: ContractorInsuranceSchema },
        verification: { type: ContractorVerificationSchema, default: {} },
        hourlyRate: { type: Number },
        ratings: { type: ContractorRatingsSchema },
        certifications: { type: [ContractorCertificationSchema], default: [] },
        portfolio: { type: [ContractorPortfolioSchema], default: [] },
        savedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
        riskScore: { type: Number, default: 0 },
        activeProjects: { type: Number, default: 0 },
        completedProjects: { type: Number, default: 0 },
        averageBudget: { type: Number, default: 0 },
    },
    { timestamps: true }
);

ContractorSchema.index({ services: 1 });
ContractorSchema.index({ 'verification.businessVerificationStatus': 1 });

export default model<IContractor>('Contractor', ContractorSchema);