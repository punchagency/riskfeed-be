export interface AuthenticatedRequest extends Request{
    user?: {
        _id: string;
        email: string;
        role: string;
    };
}