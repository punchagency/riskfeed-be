import { Schema, model, Document } from "mongoose";

export const PROJECT_STATUSES = ['draft', 'published', 'in_progress', 'completed', 'cancelled',] as const;
export const PROJECT_MILESTONES_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled',] as const;
export const PROJECT_RISK_LEVELS = ['low', 'medium', 'high'] as const;

export interface IProjectPropertySnapshot {
    type: string;
    name?: string;
    address: {
        street: string;
        zipcode: string;
        city: string;
        state: string;
        country: string;
    };
    ownershipType?: string;
    sizeSqFt?: number;
    ownerName?: string;
    images?: string[];
    documents?: string[];
}

export interface IProjectMilestone {
    name: string;
    percentage: number;
    amount: number;
    sequence: number;
    status: typeof PROJECT_MILESTONES_STATUSES[number];
    transaction?: Schema.Types.ObjectId;
}

export interface IProjectMatchEvaluation {
    contractor?: Schema.Types.ObjectId;
    matchPercentage: number;
    riskFactor: number;
    evaluatedAt: Date;
}

export interface IProject extends Document {
    homeowner: Schema.Types.ObjectId;
    title: string;
    description: string;
    property: IProjectPropertySnapshot;
    minBudget: number;
    maxBudget: number;
    durationDays?: number;
    durationRange?: {
        minDays: number;
        maxDays: number;
    };
    startDate?: Date;
    status: typeof PROJECT_STATUSES[number];
    riskLevel?: typeof PROJECT_RISK_LEVELS[number];
    selectedContractor?: Schema.Types.ObjectId;
    acceptedProposal?: Schema.Types.ObjectId;
    milestones?: IProjectMilestone[];
    matchEvaluations?: IProjectMatchEvaluation[];
    matchPercentage?: number;
    riskFactor?: number;
}

const ProjectPropertySnapshotSchema = new Schema<IProjectPropertySnapshot>(
    {
        type: { type: String, required: true },
        name: { type: String },
        address: {
            street: { type: String, required: true },
            zipcode: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, required: true },
        },
        ownershipType: { type: String },
        sizeSqFt: { type: Number },
        ownerName: { type: String },
        images: { type: [String], default: [] },
        documents: { type: [String], default: [] },
    },
    { _id: false }
);

const ProjectMilestoneSchema = new Schema<IProjectMilestone>(
    {
        name: { type: String, required: true },
        percentage: { type: Number, required: true },
        amount: { type: Number, required: true },
        sequence: { type: Number, required: true },
        status: {
            type: String,
            enum: PROJECT_MILESTONES_STATUSES,
            default: 'pending',
        },
        transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    },
    { _id: true }
);

const ProjectMatchEvaluationSchema = new Schema<IProjectMatchEvaluation>(
    {
        contractor: { type: Schema.Types.ObjectId, ref: 'Contractor', required: true },
        matchPercentage: { type: Number, required: true },
        riskFactor: { type: Number, required: true },
        evaluatedAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const ProjectSchema = new Schema<IProject>(
    {
        homeowner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        property: { type: ProjectPropertySnapshotSchema, required: true },
        minBudget: { type: Number, required: true },
        maxBudget: { type: Number, required: true },
        durationDays: { type: Number },
        durationRange: {
            minDays: { type: Number },
            maxDays: { type: Number },
        },
        startDate: { type: Date },
        status: { type: String, enum: PROJECT_STATUSES, default: 'draft', index: true },
        riskLevel: { type: String, enum: PROJECT_RISK_LEVELS },
        selectedContractor: { type: Schema.Types.ObjectId, ref: 'Contractor' },
        acceptedProposal: { type: Schema.Types.ObjectId, ref: 'Proposal' },
        milestones: { type: [ProjectMilestoneSchema], default: [] },
        matchEvaluations: { type: [ProjectMatchEvaluationSchema], default: [] },
        matchPercentage: { type: Number },
        riskFactor: { type: Number },
    },
    { timestamps: true }
);

ProjectSchema.index({ status: 1, minBudget: 1, maxBudget: 1 });
ProjectSchema.index({ title: 'text', 'property.type': 'text', 'property.ownerName': 'text' });
ProjectSchema.index({ selectedContractor: 1 });

export default model<IProject>('Project', ProjectSchema);

