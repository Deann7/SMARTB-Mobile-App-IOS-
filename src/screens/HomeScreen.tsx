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

export const HomeScreen: React.FC = () => {
  // TODO: Replace with actual user data from auth context
  const userName = "John Doe";
  const userType = "Pasien TB";

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    console.log('Logout user');
    router.replace('/');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2D5A4F" />
      <SafeAreaView className="flex-1 bg-smar-light">
        {/* Header */}
        <View className="bg-smar-green px-6 py-6 rounded-b-3xl">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-kollektif text-lg">
                Selamat datang,
              </Text>
              <Text className="text-white font-kollektif text-2xl font-bold">
                {userName}
              </Text>
              <Text className="text-white font-kollektif text-sm opacity-80">
                {userType}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-white/20 p-3 rounded-full"
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-6">
            {/* Quick Stats */}
            <View className="mb-6">
              <Text className="text-smar-green font-kollektif text-xl font-bold mb-4">
                Ringkasan Hari Ini
              </Text>
              
              <View className="flex-row space-x-4">
                <View className="flex-1 bg-white p-4 rounded-xl">
                  <View className="items-center">
                    <Ionicons name="medical" size={32} color="#2D5A4F" />
                    <Text className="text-smar-green font-kollektif text-2xl font-bold mt-2">
                      2/3
                    </Text>
                    <Text className="text-gray-600 font-kollektif text-sm text-center">
                      Obat Diminum
                    </Text>
                  </View>
                </View>
                
                <View className="flex-1 bg-white p-4 rounded-xl">
                  <View className="items-center">
                    <Ionicons name="calendar" size={32} color="#E8B4A4" />
                    <Text className="text-smar-green font-kollektif text-2xl font-bold mt-2">
                      45
                    </Text>
                    <Text className="text-gray-600 font-kollektif text-sm text-center">
                      Hari Pengobatan
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Menu Grid */}
            <View className="mb-6">
              <Text className="text-smar-green font-kollektif text-xl font-bold mb-4">
                Menu Utama
              </Text>
              
              <View className="flex-row flex-wrap">
                {/* TODO: Replace with actual navigation */}
                <TouchableOpacity className="w-1/2 p-2">
                  <View className="bg-white p-6 rounded-xl items-center">
                    <Ionicons name="medical" size={40} color="#2D5A4F" />
                    <Text className="text-smar-green font-kollektif font-medium mt-2 text-center">
                      Jadwal Obat
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity className="w-1/2 p-2">
                  <View className="bg-white p-6 rounded-xl items-center">
                    <Ionicons name="stats-chart" size={40} color="#E8B4A4" />
                    <Text className="text-smar-green font-kollektif font-medium mt-2 text-center">
                      Progress
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity className="w-1/2 p-2">
                  <View className="bg-white p-6 rounded-xl items-center">
                    <Ionicons name="people" size={40} color="#87CEEB" />
                    <Text className="text-smar-green font-kollektif font-medium mt-2 text-center">
                      Keluarga
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity className="w-1/2 p-2">
                  <View className="bg-white p-6 rounded-xl items-center">
                    <Ionicons name="chatbubbles" size={40} color="#2D5A4F" />
                    <Text className="text-smar-green font-kollektif font-medium mt-2 text-center">
                      Konsultasi
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Activity */}
            <View className="mb-6">
              <Text className="text-smar-green font-kollektif text-xl font-bold mb-4">
                Aktivitas Terbaru
              </Text>
              
              <View className="bg-white rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-kollektif font-medium text-gray-800">
                      Obat pagi berhasil diminum
                    </Text>
                    <Text className="font-kollektif text-sm text-gray-500">
                      08:30 WIB
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="time" size={20} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-kollektif font-medium text-gray-800">
                      Reminder: Obat siang dalam 30 menit
                    </Text>
                    <Text className="font-kollektif text-sm text-gray-500">
                      11:30 WIB
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
