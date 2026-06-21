import axiosInstance from './axios';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt?: string;
};

const normalizeNotification = (raw: any): AppNotification => ({
  id: String(raw?.id ?? ''),
  title: String(raw?.title ?? 'Notification'),
  body: String(raw?.body ?? ''),
  read: Boolean(raw?.read ?? raw?.isRead ?? false),
  createdAt: raw?.createdAt ? String(raw.createdAt) : raw?.created_at ? String(raw.created_at) : undefined,
});

export const notificationApi = {
  getMyNotifications: async (userId: string): Promise<AppNotification[]> => {
    const res = await axiosInstance.get('/api/notifications/my', {
      headers: { 'X-User-Id': userId },
    });
    return (Array.isArray(res.data) ? res.data : []).map(normalizeNotification);
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    const res = await axiosInstance.put(`/api/notifications/${id}/read`);
    return normalizeNotification(res.data);
  },
};

