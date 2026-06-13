// frontend/types/notification.ts

export type NotificationType = "deadline" | "milestone" | "team" | "system";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
}