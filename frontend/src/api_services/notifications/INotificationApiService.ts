import type { UserNotification } from '../../models/notifications/UserNotification';

export interface INotificationApiService {
  getMyNotifications(): Promise<UserNotification[]>;

  markNotificationAsRead(
    notificationId: string
  ): Promise<void>;

  markAllNotificationsAsRead(): Promise<void>;
}