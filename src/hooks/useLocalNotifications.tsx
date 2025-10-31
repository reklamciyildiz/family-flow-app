import { useEffect } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useLocalNotifications = () => {
  useEffect(() => {
    // İzin kontrolü ve isteme (sadece native platformlarda)
    if (Capacitor.isNativePlatform()) {
      checkAndRequestPermissions();
    }
  }, []);

  const checkAndRequestPermissions = async () => {
    try {
      const permission = await LocalNotifications.checkPermissions();
      
      if (permission.display === 'prompt' || permission.display === 'prompt-with-rationale') {
        await LocalNotifications.requestPermissions();
      }
    } catch (error) {
      console.error('Bildirim izni alınamadı:', error);
    }
  };

  const scheduleNotification = async (options: {
    id: number;
    title: string;
    body: string;
    scheduleAt: Date;
    data?: any;
  }) => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Web platformunda bildirimler çalışmaz');
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: options.id,
            title: options.title,
            body: options.body,
            schedule: { at: options.scheduleAt },
            sound: 'default',
            smallIcon: 'ic_launcher',
            iconColor: '#4F46E5',
            extra: options.data,
          },
        ],
      });
      
      console.log(`Bildirim zamanlandı: ${options.title} - ${options.scheduleAt}`);
    } catch (error) {
      console.error('Bildirim zamanlama hatası:', error);
    }
  };

  const cancelNotification = async (id: number) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      console.log(`Bildirim iptal edildi: ${id}`);
    } catch (error) {
      console.error('Bildirim iptal hatası:', error);
    }
  };

  const cancelAllNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
        console.log(`${pending.notifications.length} bildirim iptal edildi`);
      }
    } catch (error) {
      console.error('Tüm bildirimleri iptal hatası:', error);
    }
  };

  const getPendingNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return [];

    try {
      const pending = await LocalNotifications.getPending();
      return pending.notifications;
    } catch (error) {
      console.error('Bekleyen bildirimler alınamadı:', error);
      return [];
    }
  };

  return {
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getPendingNotifications,
    checkAndRequestPermissions,
  };
};

