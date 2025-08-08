import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettings } from '../hooks/useSettings';

export const SettingsScreen: React.FC = () => {
  const { settings, notificationsSupported, updateSetting, updateMedicationAlarmTime } = useSettings();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handlePatientDataPress = () => {
    router.push('/(protected)/about-tb');
  };

  const handleBackPress = () => {
    router.back();
  };

  const CustomToggle: React.FC<{
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }> = ({ value, onValueChange, disabled = false }) => {
    return (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5E5', true: '#2D5A4F' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor="#E5E5E5"
        disabled={disabled}
      />
    );
  };

  const TimePicker: React.FC<{
    time: string;
    onTimeChange: (time: string) => void;
  }> = ({ time, onTimeChange }) => {
    const showTimePickerModal = () => {
      // For now, we'll use a simple time selection
      // In a real app, you'd use a proper time picker component
      Alert.prompt(
        'Set Alarm Time',
        'Enter time in HH:MM format',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Set', 
            onPress: (newTime) => {
              if (newTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
                onTimeChange(newTime);
              } else {
                Alert.alert('Invalid Time', 'Please enter time in HH:MM format');
              }
            }
          }
        ],
        'plain-text',
        time
      );
    };
    
    return (
      <TouchableOpacity 
        onPress={showTimePickerModal}
        className="items-center py-2"
      >
        <Text className="text-gray-700 font-kollektif text-lg">
          Pasang alarm pukul
        </Text>
        <Text className="text-gray-700 font-kollektif text-2xl font-bold">
          {time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2D5A4F" />
      <SafeAreaView className="flex-1 bg-smar-light">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="bg-smar-green px-6 pt-8 pb-16 relative">
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBackPress}
              className="absolute top-12 left-6 z-10"
              activeOpacity={0.8}
            >
              <View className="bg-white/20 rounded-full p-2">
                <Text className="text-white font-kollektif text-lg">←</Text>
              </View>
            </TouchableOpacity>

            {/* Header Content */}
            <View className="flex-row items-center justify-between mt-12">
              <View className="bg-smar-green rounded-lg p-4">
                <Text className="text-white font-kollektif text-xl font-bold">
                  Pengaturan
                </Text>
              </View>
              
              {/* Settings Icons */}
              <View className="flex-row">
                <Ionicons name="settings" size={24} color="#525252" />
                <Ionicons name="settings" size={20} color="#525252" style={{ marginLeft: -8 }} />
                <Ionicons name="settings" size={16} color="#525252" style={{ marginLeft: -8 }} />
              </View>
            </View>
          </View>

          {/* Settings Content */}
          <View className="flex-1 px-6 py-8">
            {/* Data Pasien */}
            <TouchableOpacity
              onPress={handlePatientDataPress}
              className="bg-gray-100 rounded-lg p-4 mb-4"
              activeOpacity={0.8}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700 font-kollektif text-base">
                  Data pasien
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#525252" />
              </View>
            </TouchableOpacity>

            {/* Alarm Minum Obat */}
            <View className="bg-gray-100 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-kollektif text-base">
                  Alarm minum obat
                </Text>
                <CustomToggle
                  value={settings.medicationAlarmEnabled}
                  onValueChange={(value) => updateSetting('medicationAlarmEnabled', value)}
                />
              </View>
              
              {settings.medicationAlarmEnabled && (
                <TimePicker
                  time={settings.medicationAlarmTime}
                  onTimeChange={updateMedicationAlarmTime}
                />
              )}
            </View>

            {/* Notifikasi */}
            <View className="bg-gray-100 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-kollektif text-base">
                  Notifikasi
                </Text>
                <CustomToggle
                  value={settings.notificationsEnabled}
                  onValueChange={(value) => updateSetting('notificationsEnabled', value)}
                />
              </View>
              
              {settings.notificationsEnabled && (
                <View className="ml-4">
                  <View className="bg-gray-50 rounded-lg p-3 mb-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-700 font-kollektif text-sm">
                        Notifikasi dokter & kunjungan
                      </Text>
                      <CustomToggle
                        value={settings.doctorVisitNotifications}
                        onValueChange={(value) => updateSetting('doctorVisitNotifications', value)}
                      />
                    </View>
                  </View>
                  
                  <View className="bg-gray-50 rounded-lg p-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-700 font-kollektif text-sm">
                        Informasi terbaru SMARTB
                      </Text>
                      <CustomToggle
                        value={settings.smartbInfoNotifications}
                        onValueChange={(value) => updateSetting('smartbInfoNotifications', value)}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Lokasi */}
            <View className="bg-gray-100 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700 font-kollektif text-base">
                  Lokasi
                </Text>
                <CustomToggle
                  value={settings.locationEnabled}
                  onValueChange={(value) => updateSetting('locationEnabled', value)}
                />
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="text-smar-green font-kollektif text-sm">
              SMARTB
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}; 