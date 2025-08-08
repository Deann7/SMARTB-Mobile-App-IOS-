import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../services/NotificationService';

export interface SettingsState {
  patientDataEnabled: boolean;
  medicationAlarmEnabled: boolean;
  medicationAlarmTime: string;
  notificationsEnabled: boolean;
  doctorVisitNotifications: boolean;
  smartbInfoNotifications: boolean;
  locationEnabled: boolean;
}

const defaultSettings: SettingsState = {
  patientDataEnabled: true,
  medicationAlarmEnabled: false,
  medicationAlarmTime: '07:00',
  notificationsEnabled: true,
  doctorVisitNotifications: true,
  smartbInfoNotifications: false,
  locationEnabled: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [notificationsSupported, setNotificationsSupported] = useState(false);

  useEffect(() => {
    loadSettings();
    checkNotificationSupport();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationSupport = async () => {
    const isSupported = NotificationService.isNotificationsSupported();
    setNotificationsSupported(isSupported);
    
    if (isSupported) {
      await NotificationService.requestPermissions();
    }
  };

  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const updateSetting = async (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value };
    
    // Handle special cases
    if (key === 'medicationAlarmEnabled') {
      if (value && notificationsSupported) {
        await NotificationService.scheduleMedicationAlarm(settings.medicationAlarmTime);
      } else if (!value && notificationsSupported) {
        await NotificationService.cancelMedicationAlarm();
      }
    }
    
    if (key === 'notificationsEnabled' && !value) {
      // Disable all notification sub-settings when main notification is off
      newSettings.doctorVisitNotifications = false;
      newSettings.smartbInfoNotifications = false;
    }
    
    await saveSettings(newSettings);
  };

  const updateMedicationAlarmTime = async (time: string) => {
    const newSettings = { ...settings, medicationAlarmTime: time };
    await saveSettings(newSettings);
    
    if (settings.medicationAlarmEnabled && notificationsSupported) {
      await NotificationService.scheduleMedicationAlarm(time);
    }
  };

  const sendTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
    } catch (error) {
      console.log('Error sending test notification:', error);
    }
  };

  const getScheduledNotifications = async () => {
    return await NotificationService.getScheduledNotifications();
  };

  return {
    settings,
    loading,
    notificationsSupported,
    updateSetting,
    updateMedicationAlarmTime,
    sendTestNotification,
    getScheduledNotifications,
  };
}; 