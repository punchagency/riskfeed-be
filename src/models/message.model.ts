import { Schema, model, Document } from "mongoose";

export interface IMessageEntry {
    text: string;
    attachments?: string[];
    author: Schema.Types.ObjectId;
    createdAt: Date;
}

export interface IMessage extends Document {
    participants: Schema.Types.ObjectId[];
    project?: Schema.Types.ObjectId;
    messages: IMessageEntry[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageEntrySchema = new Schema<IMessageEntry>(
    {
        text: { type: String, required: true },
        attachments: { type: [String], default: [] },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const MessageSchema = new Schema<IMessage>(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
        messages: { type: [MessageEntrySchema], default: [] },
    },
    { timestamps: true }
);

MessageSchema.index({ participants: 1 });
MessageSchema.index({ project: 1 });

export default model<IMessage>('Message', MessageSchema);