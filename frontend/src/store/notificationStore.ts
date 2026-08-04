import { create } from 'zustand';

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: number;
}

interface NotificationState {
  notifications: NotificationPayload[];
  unreadCount: number;
  addNotification: (payload: Omit<NotificationPayload, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (payload) => set((state) => {
    const newNotif: NotificationPayload = {
      ...payload,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      createdAt: Date.now(),
    };
    const notifications = [newNotif, ...state.notifications];
    return {
      notifications,
      unreadCount: state.unreadCount + 1,
    };
  }),
  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map((n) => {
      if (n.id === id && !n.read) {
        return { ...n, read: true };
      }
      return n;
    });
    const unreadCount = notifications.filter(n => !n.read).length;
    return { notifications, unreadCount };
  }),
  markAllAsRead: () => set((state) => {
    const notifications = state.notifications.map((n) => ({ ...n, read: true }));
    return { notifications, unreadCount: 0 };
  }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
