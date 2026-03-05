import { NOTIFICATION_PRIORITY, NOTIFICATION_TYPES } from "@/models/notification.model";
import NotificationModel from "@/models/notification.model";
import { Schema } from "mongoose";

const createNotification = async ({
    recipientId,
    type,
    priority = 'medium',
    title,
    message,
}: {
    recipientId: Schema.Types.ObjectId,
    type: typeof NOTIFICATION_TYPES[number],
    priority?: typeof NOTIFICATION_PRIORITY[number],
    title: string,
    message: string,
}) => {
    const notification = await NotificationModel.create({
        reciepientId: recipientId,
        type,
        priority,
        title,
        message,
    });

    return notification;
};

export default createNotification;