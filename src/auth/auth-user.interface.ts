import { USER_STATUSES } from "@/models/user.model";

export default interface AuthenticatedRequest extends Request{
    user: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?:string;
        status: typeof USER_STATUSES[number];
        createdAt: Date;
        updatedAt: Date;
        role: "user" | "contractor" | "admin";
    };
}