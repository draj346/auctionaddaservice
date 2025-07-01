import { NotificationType, PendingUpdateStatusType } from "../constants/notification.constants";

export interface INotification {
  createdAt: Date;
  message: string;
  type: NotificationType;
}

export interface IPendingUpdate {
  id: number;
  submittedBy: number;
  updatedData: JSON;
  message: string;
}

export interface INotificationCount {
  pending: number;
  total: number;
}

export interface IUpdatePendingUpdate {
    id: number;
    status: PendingUpdateStatusType;
}
