import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
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
      
      // Schedule a single daily repeating notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Waktu Minum Obat",
          body: "Jangan lupa minum obat TB Anda",
          data: { type: 'medication_reminder' },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
      
      console.log(`Medication alarm scheduled for ${time} (daily repeating)`);
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

  static async scheduleSputumReminder(accountCreationDate: string, lastCheckDate?: string | null): Promise<void> {
    try {
      // Cancel existing sputum notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const sputumNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'sputum_reminder'
      );

      for (const notification of sputumNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      // Calculate next sputum check date
      let nextCheckDate: Date;

      if (lastCheckDate) {
        // If last check date is provided, add 6 months to it
        const lastCheck = new Date(lastCheckDate);
        nextCheckDate = new Date(lastCheck.getTime() + (180 * 24 * 60 * 60 * 1000)); // 6 months = ~180 days
      } else {
        // If no last check date, schedule for 6 months from account creation date
        const accountCreated = new Date(accountCreationDate);
        nextCheckDate = new Date(accountCreated.getTime() + (180 * 24 * 60 * 60 * 1000));
      }
      
      // Only schedule if the date is in the future
      const now = new Date();
      if (nextCheckDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Pengingat Sputum Checkup",
            body: "Saatnya melakukan pemeriksaan sputum. Jangan lupa berkonsultasi dengan dokter Anda.",
            data: { type: 'sputum_reminder' },
          },
          trigger: {
            day: nextCheckDate.getDate(),
            month: nextCheckDate.getMonth() + 1,
            year: nextCheckDate.getFullYear(),
            hour: 9,
            minute: 0,
          },
        });
        
        console.log(`Sputum reminder scheduled for ${nextCheckDate.toLocaleDateString()}`);
      } else {
        console.log('Sputum check is overdue. Scheduling for immediate notification.');
        // Schedule for 1 minute from now if overdue
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Pengingat Sputum Checkup",
            body: "Pemeriksaan sputum Anda sudah melewati jadwal. Segera konsultasi dengan dokter.",
            data: { type: 'sputum_reminder' },
          },
          trigger: {
            seconds: 60,
          },
        });
      }
    } catch (error) {
      console.log('Error scheduling sputum reminder:', error);
      throw error;
    }
  }

  static async cancelSputumReminder(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const sputumNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'sputum_reminder'
      );
      
      for (const notification of sputumNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      
      console.log('Sputum reminder cancelled');
    } catch (error) {
      console.log('Error cancelling sputum reminder:', error);
      throw error;
    }
  }

  // Helper method to check if notifications are available
  static isNotificationsSupported(): boolean {
    return true;
  }
} 
