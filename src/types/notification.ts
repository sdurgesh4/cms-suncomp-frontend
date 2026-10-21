export type NotificationType =
  | "GENERAL"
  | "ENQUIRY"
  | "FOLLOW_UP"
  | "ADMISSION"
  | "PAYMENT"
  | "FEE_DUE"
  | "ATTENDANCE"
  | "SYSTEM";

export type NotificationPriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT";

export interface Notification {
  id: number;
  recipientId?: number | null;
  recipientUsername?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface CreateNotificationRequest {
  recipientUserId: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
}