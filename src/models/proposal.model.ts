import { Schema, model, Document } from "mongoose";

export const PROPOSAL_STATUSES = ['pending', 'accepted', 'rejected',] as const;

export interface IProposalMilestone {
    name: string;
    percentage: number;
    amount: number;
    sequence: number;
}

export interface IProposal extends Document {
    project: Schema.Types.ObjectId;
    contractor: Schema.Types.ObjectId;
    coverLetter: string;
    hourlyRate: number;
    submissionDate: Date;
    status: typeof PROPOSAL_STATUSES[number];
    totalAmount: number;
    estimatedDurationDays?: number;
    estimatedStartDate?: Date;
    estimatedEndDate?: Date;
    milestones?: IProposalMilestone[];
    notes?: string;
    termsAndConditions?: string;
    matchPercentage?: number;
    riskFactor?: number;
}

const ProposalMilestoneSchema = new Schema<IProposalMilestone>(
    {
        name: { type: String, required: true },
        percentage: { type: Number, required: true },
        amount: { type: Number, required: true },
        sequence: { type: Number, required: true },
    },
    { _id: true }
);

const ProposalSchema = new Schema<IProposal>(
    {
        project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        contractor: { type: Schema.Types.ObjectId, ref: 'Contractor', required: true, index: true },
        coverLetter: { type: String, required: true },
        hourlyRate: { type: Number, required: true },
        submissionDate: { type: Date, default: Date.now },
        status: { type: String, enum: PROPOSAL_STATUSES, default: 'pending', index: true },
        totalAmount: { type: Number, required: true },
        estimatedDurationDays: { type: Number },
        estimatedStartDate: { type: Date },
        estimatedEndDate: { type: Date },
        milestones: { type: [ProposalMilestoneSchema], default: [] },
        notes: { type: String },
        termsAndConditions: { type: String },
        matchPercentage: { type: Number },
        riskFactor: { type: Number },
    },
    { timestamps: true }
);

ProposalSchema.index({ project: 1, contractor: 1 });

export default model<IProposal>('Proposal', ProposalSchema);