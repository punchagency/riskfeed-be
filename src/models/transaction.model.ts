import { Schema, model, Document } from "mongoose";

export const TRANSACTION_STATUSES = ['pending', 'authorized', 'released', 'failed', 'refunded',] as const;

export interface ITransaction extends Document {
    project: Schema.Types.ObjectId;
    proposal?: Schema.Types.ObjectId;
    contractor: Schema.Types.ObjectId;
    homeowner: Schema.Types.ObjectId;
    milestoneName: string;
    milestonePercentage: number;
    amount: number;
    dueDate?: Date;
    date?: Date;
    status: typeof TRANSACTION_STATUSES[number];
    paymentProvider?: string;
    paymentIntentId?: string;
    metadata?: Record<string, any>;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        proposal: { type: Schema.Types.ObjectId, ref: 'Proposal' },
        contractor: { type: Schema.Types.ObjectId, ref: 'Contractor', required: true, index: true },
        homeowner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        milestoneName: { type: String, required: true },
        milestonePercentage: { type: Number, required: true },
        amount: { type: Number, required: true },
        dueDate: { type: Date },
        date: { type: Date },
        status: { type: String, enum: TRANSACTION_STATUSES, default: 'pending', index: true },
        paymentProvider: { type: String },
        paymentIntentId: { type: String },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

TransactionSchema.index({ project: 1, contractor: 1 });

export default model<ITransaction>('Transaction', TransactionSchema);