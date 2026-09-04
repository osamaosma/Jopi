// ============================================================================
// MingleUp Notification Service
// In-app notifications center, unread badges, and toast event dispatching
// ============================================================================

import { Notification } from '../types';
import { StorageService, STORAGE_KEYS } from './storageService';

export class NotificationService {
  static getNotifications(): Notification[] {
    StorageService.initializeDefaults();
    return StorageService.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  static getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.is_read).length;
  }

  static addNotification(params: Partial<Notification> & { user_id: string; title: string; body: string }): Notification {
    const notifications = this.getNotifications();
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      user_id: params.user_id,
      type: params.type || 'system',
      title: params.title,
      title_ar: params.title_ar || params.title,
      body: params.body,
      body_ar: params.body_ar || params.body,
      avatar_url: params.avatar_url || '',
      reference_id: params.reference_id || '',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    notifications.unshift(newNotif);
    StorageService.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotif;
  }

  static markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
      StorageService.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }

  static markAllAsRead(): void {
    const notifications = this.getNotifications();
    notifications.forEach(n => { n.is_read = true; });
    StorageService.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
}