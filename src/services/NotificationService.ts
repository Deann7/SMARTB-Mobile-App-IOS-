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
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to receive medication reminders.',
        [{ text: 'OK' }]
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
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Waktu Minum Obat",
          body: "Jangan lupa minum obat TB Anda",
          data: { type: 'medication_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
      
      console.log(`Medication alarm scheduled for ${time}`);
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
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification from SMARTB",
          data: { type: 'test' },
        },
        trigger: {
          seconds: 1,
        } as any,
      });
      
      console.log('Test notification scheduled');
    } catch (error) {
      console.log('Error sending test notification:', error);
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