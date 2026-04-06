export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    type: string;
    createdAt: Date;
}