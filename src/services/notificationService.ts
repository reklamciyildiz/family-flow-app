import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { Task } from '@/types';
import { addHours, addDays, subHours } from 'date-fns';

/**
 * Bildirim ID'leri için hash fonksiyonu
 * Task ID'sini ve tip'i alıp benzersiz bir sayı oluşturur
 */
const generateNotificationId = (taskId: string, type: string): number => {
  const hash = `${taskId}-${type}`.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return Math.abs(hash) % 2147483647; // Android notification ID limiti
};

/**
 * Bildirim tipleri
 */
export enum NotificationType {
  TASK_DEADLINE_24H = 'deadline_24h',
  TASK_DEADLINE_2H = 'deadline_2h',
  TASK_DEADLINE_30MIN = 'deadline_30min',
  TASK_ASSIGNED = 'task_assigned',
  DAILY_SUMMARY = 'daily_summary',
  TASK_REMINDER = 'task_reminder',
}

/**
 * Merkezi bildirim servisi
 */
export class NotificationService {
  private scheduleNotification: ReturnType<typeof useLocalNotifications>['scheduleNotification'];
  private cancelNotification: ReturnType<typeof useLocalNotifications>['cancelNotification'];
  private getPendingNotifications: ReturnType<typeof useLocalNotifications>['getPendingNotifications'];

  constructor(notificationHook: ReturnType<typeof useLocalNotifications>) {
    this.scheduleNotification = notificationHook.scheduleNotification;
    this.cancelNotification = notificationHook.cancelNotification;
    this.getPendingNotifications = notificationHook.getPendingNotifications;
  }

  /**
   * Görev oluşturulduğunda deadline hatırlatmalarını zamanla
   */
  async scheduleTaskDeadlineReminders(task: Task) {
    if (!task.due_date) return;

    const dueDate = new Date(task.due_date);
    const now = new Date();

    // Geçmiş tarihse bildirim zamanlama
    if (dueDate <= now) return;

    // 24 saat öncesi hatırlatma
    const reminder24h = subHours(dueDate, 24);
    if (reminder24h > now) {
      await this.scheduleNotification({
        id: generateNotificationId(task.id, NotificationType.TASK_DEADLINE_24H),
        title: '⏰ ',
        body: `"${task.title}" için 24 saat kaldı!`,
        scheduleAt: reminder24h,
        data: {
          taskId: task.id,
          type: NotificationType.TASK_DEADLINE_24H,
          route: `/tasks/${task.id}`,
        },
      });
    }

    // 2 saat öncesi hatırlatma
    const reminder2h = subHours(dueDate, 2);
    if (reminder2h > now) {
      await this.scheduleNotification({
        id: generateNotificationId(task.id, NotificationType.TASK_DEADLINE_2H),
        title: '🔔 Acil Görev!',
        body: `"${task.title}" için sadece 2 saat kaldı!`,
        scheduleAt: reminder2h,
        data: {
          taskId: task.id,
          type: NotificationType.TASK_DEADLINE_2H,
          route: `/tasks/${task.id}`,
        },
      });
    }

    // 30 dakika öncesi hatırlatma
    const reminder30min = new Date(dueDate.getTime() - 30 * 60 * 1000);
    if (reminder30min > now) {
      await this.scheduleNotification({
        id: generateNotificationId(task.id, NotificationType.TASK_DEADLINE_30MIN),
        title: '🚨 Son Uyarı!',
        body: `"${task.title}" için 30 dakika kaldı!`,
        scheduleAt: reminder30min,
        data: {
          taskId: task.id,
          type: NotificationType.TASK_DEADLINE_30MIN,
          route: `/tasks/${task.id}`,
        },
      });
    }
  }

  /**
   * Görev için tüm bildirimleri iptal et
   */
  async cancelTaskNotifications(taskId: string) {
    // Görevle ilgili tüm bildirim tiplerini iptal et
    const types = [
      NotificationType.TASK_DEADLINE_24H,
      NotificationType.TASK_DEADLINE_2H,
      NotificationType.TASK_DEADLINE_30MIN,
      NotificationType.TASK_ASSIGNED,
      NotificationType.TASK_REMINDER,
    ];

    for (const type of types) {
      const notificationId = generateNotificationId(taskId, type);
      await this.cancelNotification(notificationId);
    }
  }

  /**
   * Görev tamamlandığında bildirimleri iptal et
   */
  async onTaskCompleted(taskId: string) {
    await this.cancelTaskNotifications(taskId);
  }

  /**
   * Görev silindiğinde bildirimleri iptal et
   */
  async onTaskDeleted(taskId: string) {
    await this.cancelTaskNotifications(taskId);
  }

  /**
   * Görev deadline'ı güncellendiğinde bildirimleri yeniden zamanla
   */
  async onTaskDeadlineUpdated(task: Task) {
    // Önce eski bildirimleri iptal et
    await this.cancelTaskNotifications(task.id);
    
    // Yeni bildirimleri zamanla
    await this.scheduleTaskDeadlineReminders(task);
  }

  /**
   * Günlük özet bildirimi zamanla (her gün 20:00)
   */
  async scheduleDailySummary(userId: string, completedTasksCount: number, totalPoints: number) {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(20, 0, 0, 0);

    await this.scheduleNotification({
      id: generateNotificationId(userId, NotificationType.DAILY_SUMMARY),
      title: '📊 Günlük Özet',
      body: `Bugün ${completedTasksCount} görev tamamladınız! 🎉 Toplam ${totalPoints} puan kazandınız.`,
      scheduleAt: tomorrow,
      data: {
        userId,
        type: NotificationType.DAILY_SUMMARY,
        route: '/dashboard',
      },
    });
  }

  /**
   * Tekrar eden görevler için haftalık/günlük hatırlatma
   */
  async scheduleRecurringTaskReminder(task: Task) {
    if (task.repeat_type === 'none') return;

    let scheduleAt: Date;
    const now = new Date();

    switch (task.repeat_type) {
      case 'daily':
        // Her sabah 08:00
        scheduleAt = addDays(now, 1);
        scheduleAt.setHours(8, 0, 0, 0);
        break;
      case 'weekly':
        // Her Pazartesi 08:00
        scheduleAt = addDays(now, 7);
        scheduleAt.setHours(8, 0, 0, 0);
        break;
      case 'monthly':
        // Her ayın 1'i 08:00
        scheduleAt = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0, 0);
        break;
      default:
        return;
    }

    await this.scheduleNotification({
      id: generateNotificationId(task.id, NotificationType.TASK_REMINDER),
      title: '🔄 Tekrar Eden Görev',
      body: `"${task.title}" görevi sizi bekliyor!`,
      scheduleAt,
      data: {
        taskId: task.id,
        type: NotificationType.TASK_REMINDER,
        route: `/tasks/${task.id}`,
      },
    });
  }

  /**
   * Bekleyen tüm bildirimleri listele (debug için)
   */
  async listPendingNotifications() {
    const pending = await this.getPendingNotifications();
    console.log(`Bekleyen bildirimler: ${pending.length}`);
    pending.forEach((notif: any) => {
      console.log(`- ID: ${notif.id}, Title: ${notif.title}, Schedule: ${notif.schedule?.at}`);
    });
    return pending;
  }
}

// Singleton instance için helper
let notificationServiceInstance: NotificationService | null = null;

export const getNotificationService = (notificationHook: ReturnType<typeof useLocalNotifications>): NotificationService => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService(notificationHook);
  }
  return notificationServiceInstance;
};

