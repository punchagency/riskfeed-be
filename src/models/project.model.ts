import { Schema, model, Document, Types } from "mongoose";

export const PROJECT_STATUSES = ['draft', 'published', 'in_progress', 'completed', 'cancelled',] as const;
export const PROJECT_MILESTONES_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled',] as const;
export const PROJECT_RISK_LEVELS = ['low', 'medium', 'high'] as const;
export const PROJECT_TYPES = ['kitchen_remodeling',  'bathroom_remodeling',  'roofing',  'flooring',  'painting',  'electrical',  'plumbing',  'hvac',  'landscaping',  'deck_patio',  'basement_finishing',  'windows_doors',] as const;
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
    homeowner: Types.ObjectId;
    title: string;
    description: string;
    projectType: typeof PROJECT_TYPES[number];
    property: Types.ObjectId;
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
    projectImages?: string[];
    projectDocuments?: string[];
    invitedContractors?: Types.ObjectId[];
}


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
        homeowner: { type: Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        projectType: { type: String, enum: PROJECT_TYPES, required: true },
        property: { type: Types.ObjectId, ref: 'Properties', required: true },
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
        projectDocuments: { type: [String], default: [] },
        projectImages: { type: [String], default: [] },
        invitedContractors: { type: [Types.ObjectId], ref: 'Contractor', default: [] },
    },
    { timestamps: true }
);

ProjectSchema.index({ status: 1, minBudget: 1, maxBudget: 1 });
ProjectSchema.index({ selectedContractor: 1 });

export default model<IProject>('Project', ProjectSchema);

