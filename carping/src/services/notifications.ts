import { api } from './api';
import type { ApiResponse, Notification } from '../types';

export const notificationsService = {
  async getNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>('/notifications');
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return res.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const res = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`, {});
    return res.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all', {});
  },
};
