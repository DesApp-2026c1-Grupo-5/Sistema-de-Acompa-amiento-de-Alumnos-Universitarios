import { api } from './api';

export const getNotifications = (query = '') =>
  api.get(`/notificaciones${query}`);

export const markNotificationAsRead = (id) =>
  api.patch(`/notificaciones/${id}/leida`);

export const markAllNotificationsAsRead = () =>
  api.patch('/notificaciones/leidas');

export const deleteNotification = (id) =>
  api.delete(`/notificaciones/${id}`);
