import { NotificationType } from "../constants/notification.constants";

export interface INotification {
  createdAt: Date;
  message: string;
  type: NotificationType;
  role: string;
  isRead: boolean;
  customAttributes: JSON | null;
}

export interface IPendingUpdate {
  id: number;
  submittedBy: number;
  updatedData: JSON;
  message: string;
  previousData: JSON;
  type: NotificationType;
  role: string;
  createdAt: Date;
}

export interface INotificationCount {
  total: number;
}

export interface IUpdatePendingUpdate {
    id: number;
    status: boolean;
}
