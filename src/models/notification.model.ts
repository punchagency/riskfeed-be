import { Schema, model, Document } from "mongoose";

export const NOTIFICATION_TYPES = [
    'quotation',
    'system',
] as const;

export const NOTIFICATION_PRIORITY = ['low', 'medium', 'high', 'urgent'] as const;
export interface INotification extends Document {
    reciepientId: Schema.Types.ObjectId;
    type: typeof NOTIFICATION_TYPES[number];
    priority: typeof NOTIFICATION_PRIORITY[number];
    title: string;
    message: string;
    read: boolean;
}

const NotificationSchema = new Schema<INotification>({
    reciepientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    priority: { type: String, enum: NOTIFICATION_PRIORITY, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
}, {
    timestamps: true
});

NotificationSchema.index({ reciepientId: 1, read: 1 });
NotificationSchema.index({ reciepientId: 1 });

export default model<INotification>('Notification', NotificationSchema);