import api from '../axios/AxiosInstance';

import type { UserNotification } from '../../models/notifications/UserNotification';
import type { INotificationApiService } from './INotificationApiService';

export const notificationApi:
  INotificationApiService = {
    async getMyNotifications() {
      return (
        await api.get<UserNotification[]>(
          '/notifications'
        )
      ).data;
    },

    async markNotificationAsRead(notificationId) {
      await api.patch(
        `/notifications/${notificationId}/read`
      );
    },

    async markAllNotificationsAsRead() {
      await api.patch('/notifications/read-all');
    },
  };