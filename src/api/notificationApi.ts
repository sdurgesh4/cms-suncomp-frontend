import axios from "./axios";

import type {
  CreateNotificationRequest,
  Notification,
} from "../types/notification";

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>(
      "/notifications",
    );

    return response.data;
  },

  getUnread: async (): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>(
      "/notifications/unread",
    );

    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get<number>(
      "/notifications/unread/count",
    );

    return response.data;
  },

  markAsRead: async (
    id: number,
  ): Promise<void> => {
    await axios.patch(
      `/notifications/${id}/read`,
    );
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.patch(
      "/notifications/read-all",
    );
  },

  delete: async (
    id: number,
  ): Promise<void> => {
    await axios.delete(
      `/notifications/${id}`,
    );
  },

  create: async (
    request: CreateNotificationRequest,
  ): Promise<Notification> => {
    const response =
      await axios.post<Notification>(
        "/notifications",
        request,
      );

    return response.data;
  },
};