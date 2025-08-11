import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Izin Notifikasi Diperlukan',
        'Mohon aktifkan notifikasi untuk menerima pengingat minum obat.',
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Pengaturan', 
            onPress: () => {
              // On Android, we can guide user to settings
              console.log('Redirect to notification settings');
            }
          }
        ]
      );
      return false;
    }
    
    return true;
  }

  static async scheduleMedicationAlarm(time: string): Promise<void> {
    try {
      // Cancel existing medication notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const medicationNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'medication_reminder'
      );
      
      for (const notification of medicationNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      
      const [hours, minutes] = time.split(':').map(Number);
      
      // Calculate seconds until the specified time today
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const secondsUntilTrigger = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);
      
      // Schedule the first notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Waktu Minum Obat",
          body: "Jangan lupa minum obat TB Anda",
          data: { type: 'medication_reminder' },
        },
        trigger: {
          seconds: secondsUntilTrigger,
          repeats: false,
        },
      });
      
      // Schedule daily repeating notifications (Android-compatible approach)
      // Schedule for the next 30 days
      for (let i = 1; i <= 30; i++) {
        const futureDate = new Date(scheduledTime);
        futureDate.setDate(futureDate.getDate() + i);
        
        const secondsUntilFuture = Math.floor((futureDate.getTime() - now.getTime()) / 1000);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Waktu Minum Obat",
            body: "Jangan lupa minum obat TB Anda",
            data: { type: 'medication_reminder' },
          },
          trigger: {
            seconds: secondsUntilFuture,
            repeats: false,
          },
        });
      }
      
      console.log(`Medication alarm scheduled for ${time} (next 30 days)`);
    } catch (error) {
      console.log('Error scheduling medication alarm:', error);
      throw error;
    }
  }

  static async cancelMedicationAlarm(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const medicationNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'medication_reminder'
      );
      
      for (const notification of medicationNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      
      console.log('Medication alarm cancelled');
    } catch (error) {
      console.log('Error cancelling medication alarm:', error);
      throw error;
    }
  }

  static async sendTestNotification(): Promise<void> {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification from SMARTB",
          data: { type: 'test' },
        },
        trigger: {
          seconds: 2,
        },
      });
      
      console.log('Test notification scheduled for 2 seconds');
      Alert.alert(
        'Test Notification',
        'Notifikasi test telah dijadwalkan dan akan muncul dalam 2 detik',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('Error sending test notification:', error);
      Alert.alert(
        'Error',
        `Gagal mengirim test notification: ${error}`,
        [{ text: 'OK' }]
      );
      throw error;
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.log('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Helper method to check if notifications are available
  static isNotificationsSupported(): boolean {
    return true;
  }
} 