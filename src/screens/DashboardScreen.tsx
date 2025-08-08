import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const DashboardScreen: React.FC = () => {
  // TODO: Replace with actual user data from auth context
  const currentDay = 90;
  const treatmentPhase = "Pengobatan Fase Lanjutan";

  const handleInputDataToday = () => {
    // Navigate to input data screen
    router.push('/(protected)/input-data' as any);
  };

  const handleMenuLainnya = () => {
    // Navigate to menu screen or show menu options
    router.push('/(protected)/menu' as any);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with background */}
          <View className="bg-smar-green px-6 pt-8 pb-16 relative">
            {/* Welcome message */}
            <View className="bg-smar-green rounded-lg p-4 mb-6">
              <Text className="text-white font-kollektif text-lg font-bold text-center">
                Selamat datang kembali!
              </Text>
              <Text className="text-white font-kollektif text-lg font-bold text-center">
                Putri
              </Text>
            </View>

            {/* Treatment Progress Card */}
            <View className="bg-white rounded-3xl p-6 mx-4 shadow-lg">
              <View className="items-center">
                <Text className="text-smar-green font-kollektif text-4xl font-bold mb-2">
                  Hari {currentDay}
                </Text>
                <Text className="text-gray-600 font-kollektif text-base mb-4">
                  {treatmentPhase}
                </Text>
                
                {/* Lungs illustration area */}
                <View className="h-32 w-32 bg-gray-100 rounded-full items-center justify-center mb-6">
                  <Ionicons name="fitness" size={48} color="#22C55E" />
                </View>

                <Text className="text-gray-600 font-kollektif text-sm text-center mb-6">
                  Semangat menuntaskan pohon penyembuhan Anda!
                </Text>

                {/* Input Data Button */}
                <TouchableOpacity
                  onPress={handleInputDataToday}
                  className="bg-white border-2 border-gray-300 rounded-full px-8 py-4 mb-4 shadow-sm"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-700 font-kollektif text-base font-medium">
                    Input Data Hari Ini
                  </Text>
                </TouchableOpacity>

                {/* Menu Lainnya Button */}
                <TouchableOpacity
                  onPress={handleMenuLainnya}
                  className="bg-white border-2 border-gray-300 rounded-full px-8 py-4 shadow-sm"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-700 font-kollektif text-base font-medium">
                    Menu Lainnya
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Additional content area */}
          <View className="flex-1 px-6 py-8">
            {/* Quick Actions */}
            <Text className="text-smar-green font-kollektif text-xl font-bold mb-4">
              Aksi Cepat
            </Text>
            
            <View className="grid grid-cols-2 gap-4">
              <TouchableOpacity 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                onPress={() => router.push('/(protected)/medication-reminder' as any)}
              >
                <Ionicons name="alarm" size={24} color="#22C55E" />
                <Text className="text-gray-700 font-kollektif text-sm mt-2">
                  Pengingat Obat
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                onPress={() => router.push('/(protected)/progress-history' as any)}
              >
                <Ionicons name="bar-chart" size={24} color="#22C55E" />
                <Text className="text-gray-700 font-kollektif text-sm mt-2">
                  Riwayat Progress
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                onPress={() => router.push('/(protected)/doctor-consultation' as any)}
              >
                <Ionicons name="medical" size={24} color="#22C55E" />
                <Text className="text-gray-700 font-kollektif text-sm mt-2">
                  Konsultasi Dokter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                onPress={() => router.push('/(protected)/health-tips' as any)}
              >
                <Ionicons name="heart" size={24} color="#22C55E" />
                <Text className="text-gray-700 font-kollektif text-sm mt-2">
                  Tips Kesehatan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
