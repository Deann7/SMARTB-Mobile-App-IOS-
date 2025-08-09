import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { UserDashboard } from '../lib/supabase';
import { AuthService } from '../services/authService';
import { DailyInputService } from '../services/dailyInputService';
import { RewardService } from '../services/rewardService';

export const DashboardScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayInputStatus, setTodayInputStatus] = useState({
    hasInput: false,
    isComplete: false,
    pointsEarned: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check and refresh session if needed
      const session = await AuthService.checkAndRefreshSession();
      if (!session) {
        console.log('No valid session found, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      // Get current user
      const user = await AuthService.getCurrentUser();
      if (!user) {
        console.log('No user found, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      // Ensure user profile exists (create if it doesn't)
      try {
        await AuthService.ensureUserProfile(user.id, new Date().toISOString().split('T')[0]);
      } catch (profileError) {
        console.error('Failed to ensure user profile:', profileError);
        // Continue anyway - the user is authenticated
      }

      // Get user dashboard data
      const dashboardData = await AuthService.getUserDashboard(user.id);
      setUserData(dashboardData);

      // Get today's input status
      const todayStatus = await DailyInputService.getTodayInputStatus();
      setTodayInputStatus(todayStatus);

      // Check for new achievements
      await RewardService.checkAndAwardAchievements();

    } catch (error) {
      console.error('Load dashboard data error:', error);
      Alert.alert('Error', 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputDataToday = () => {
    if (todayInputStatus.hasInput) {
      Alert.alert(
        'Data Sudah Diinput',
        'Anda sudah menginput data hari ini. Apakah ingin mengubah data?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Ubah', onPress: () => router.push('/(protected)/input-data' as any) }
        ]
      );
    } else {
      router.push('/(protected)/input-data' as any);
    }
  };

  const handleMenuLainnya = () => {
    router.push('/(protected)/menu' as any);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="text-gray-600 mt-4 font-kollektif">Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
        >
          {/* Header with background */}
          <View className="bg-smar-green px-6 pt-8 pb-16 relative">
            {/* Welcome message */}
            <View className="bg-smar-green rounded-lg p-4 mb-6">
              <Text className="text-white font-kollektif text-lg font-bold text-center">
                Selamat datang kembali!
              </Text>
              <Text className="text-white font-kollektif text-lg font-bold text-center">
                {userData?.full_name || 'Pengguna'}
              </Text>
            </View>

            {/* Treatment Progress Card */}
            <View className="bg-white rounded-3xl p-6 mx-4 shadow-lg">
              <View className="items-center">
                <Text className="text-smar-green font-kollektif text-4xl font-bold mb-2">
                  Hari {userData?.current_day || 0}
                </Text>
                <Text className="text-gray-600 font-kollektif text-base mb-4">
                  {userData?.treatment_phase || 'Pengobatan Fase Intensif'}
                </Text>
                
                {/* Points Display */}
                <View className="bg-green-50 rounded-lg p-4 mb-4 w-full">
                  <Text className="text-smar-green font-kollektif text-lg font-bold text-center">
                    {userData?.total_points || 0} Poin
                  </Text>
                  <Text className="text-gray-600 font-kollektif text-sm text-center">
                    Streak: {userData?.streak_days || 0} hari
                  </Text>
                </View>

                {/* Progress Stats */}
                <View className="flex-row justify-between w-full mb-6">
                  <View className="items-center flex-1">
                    <Text className="text-smar-green font-kollektif text-2xl font-bold">
                      {userData?.complete_inputs || 0}
                    </Text>
                    <Text className="text-gray-600 font-kollektif text-xs text-center">
                      Input Lengkap
                    </Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-smar-green font-kollektif text-2xl font-bold">
                      {userData?.medication_days || 0}
                    </Text>
                    <Text className="text-gray-600 font-kollektif text-xs text-center">
                      Hari Minum Obat
                    </Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-smar-green font-kollektif text-2xl font-bold">
                      {userData?.total_inputs || 0}
                    </Text>
                    <Text className="text-gray-600 font-kollektif text-xs text-center">
                      Total Input
                    </Text>
                  </View>
                </View>

                {/* Lungs illustration area */}
                <View className="h-32 w-32 bg-gray-100 rounded-full items-center justify-center mb-6">
                  <Ionicons name="fitness" size={48} color="#22C55E" />
                </View>

                <Text className="text-gray-600 font-kollektif text-sm text-center mb-6">
                  Semangat menuntaskan pohon penyembuhan Anda!
                </Text>

                {/* Today's Status */}
                {todayInputStatus.hasInput && (
                  <View className="bg-green-50 rounded-lg p-3 mb-4 w-full">
                    <Text className="text-green-700 font-kollektif text-sm text-center">
                      ✅ Data hari ini sudah diinput (+{todayInputStatus.pointsEarned} poin)
                    </Text>
                  </View>
                )}

                {/* Input Data Button */}
                <TouchableOpacity
                  onPress={handleInputDataToday}
                  className={`rounded-full px-8 py-4 mb-4 shadow-sm ${
                    todayInputStatus.hasInput 
                      ? 'bg-blue-500 border-2 border-blue-600' 
                      : 'bg-white border-2 border-gray-300'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className={`font-kollektif text-base font-medium ${
                    todayInputStatus.hasInput ? 'text-white' : 'text-gray-700'
                  }`}>
                    {todayInputStatus.hasInput ? 'Ubah Data Hari Ini' : 'Input Data Hari Ini'}
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

          {/* Quick Actions */}
          <View className="px-6 py-4">
            <Text className="text-gray-700 font-kollektif text-lg font-bold mb-4">
              Akses Cepat
            </Text>
            
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="bg-white rounded-lg p-4 flex-1 mr-2 shadow-sm"
                onPress={() => router.push('/(protected)/community' as any)}
              >
                <View className="items-center">
                  <Ionicons name="people" size={24} color="#22C55E" />
                  <Text className="text-gray-700 font-kollektif text-sm mt-2 text-center">
                    Komunitas
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-white rounded-lg p-4 flex-1 ml-2 shadow-sm"
                onPress={() => router.push('/(protected)/settings' as any)}
              >
                <View className="items-center">
                  <Ionicons name="settings" size={24} color="#22C55E" />
                  <Text className="text-gray-700 font-kollektif text-sm mt-2 text-center">
                    Pengaturan
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
