import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserDashboard, supabase } from '../lib/supabase';
import { AuthService } from '../services/authService';
import { DailyInputService } from '../services/dailyInputService';

export const DashboardScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserDashboard | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayInputStatus, setTodayInputStatus] = useState({
    hasInput: false,
    isComplete: false,
    pointsEarned: 0,
  });
  const [daysSinceRegistration, setDaysSinceRegistration] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh dashboard when screen is focused (e.g., returning from input screen)
  useFocusEffect(
    useCallback(() => {
      console.log('Dashboard screen focused, refreshing data...');
      loadDashboardData();
    }, [])
  );

  // Function to calculate days since registration
  const calculateDaysSinceRegistration = (createdAt: string): number => {
    const registrationDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - registrationDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysDifference + 1; // +1 because first day should be day 1, not day 0
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await AuthService.getCurrentUser();
      if (!user) {
        console.log('No user found, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      console.log('Loading dashboard for user:', user.id);

      // Store current user data
      setCurrentUser(user);

      // Calculate days since registration
      if (user.created_at) {
        const daysSince = calculateDaysSinceRegistration(user.created_at);
        setDaysSinceRegistration(daysSince);
        console.log('Days since registration:', daysSince);
      }

      // Get treatment progress information
      const treatmentProgress = await DailyInputService.getTreatmentProgress();
      const currentDay = treatmentProgress.currentDay;
      const treatmentPhase = treatmentProgress.treatmentPhase;

      // Get user dashboard data using direct table access (more reliable)
      try {
        console.log('Trying to get user dashboard from user_dashboard table...');
        
        // Try to get from user_dashboard table first
        const { data: dashboardData, error: dashboardError } = await supabase
          .from('user_dashboard')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (dashboardError) {
          console.log('user_dashboard table access failed:', dashboardError.message);
          console.log('User dashboard not found, creating...');
          
          // Try to create dashboard entry
          try {
            const { data: newDashboard, error: createError } = await supabase
              .from('user_dashboard')
              .insert({
                user_id: user.id,
                total_points: 0,
                current_streak: 0,
                longest_streak: 0
              })
              .select()
              .single();
            
            if (createError) {
              console.log('Failed to create dashboard, using default:', createError.message);
              throw createError;
            } else {
              console.log('Dashboard created successfully:', newDashboard);
              const formattedDashboard: UserDashboard = {
                user_id: newDashboard.user_id,
                full_name: user.full_name || 'User',
                current_day: currentDay,
                total_points: newDashboard.total_points || 0,
                streak_days: newDashboard.current_streak || 0,
                total_inputs: 0,
                complete_inputs: 0,
                medication_days: 0,
                treatment_phase: treatmentPhase,
                last_data_input_date: undefined,
              };
              setUserData(formattedDashboard);
            }
          } catch (createError) {
            console.log('Create dashboard failed, using AuthService fallback');
            const fallbackData = await AuthService.getUserDashboard(user.id);
            // Update fallback data with calculated current day
            fallbackData.current_day = currentDay;
            fallbackData.treatment_phase = treatmentPhase;
            setUserData(fallbackData);
          }
        } else {
          console.log('Dashboard data loaded from user_dashboard table:', dashboardData);
          const formattedDashboard: UserDashboard = {
            user_id: dashboardData.user_id,
            full_name: user.full_name || 'User',
            current_day: currentDay, // Calculated from treatment_start_date
            total_points: dashboardData.total_points || 0,
            streak_days: dashboardData.current_streak || 0,
            total_inputs: 0,
            complete_inputs: 0,
            medication_days: 0,
            treatment_phase: treatmentPhase,
            last_data_input_date: undefined,
          };
          setUserData(formattedDashboard);
        }
      } catch (dashboardError) {
        console.error('Get user dashboard error:', dashboardError);
        console.log('All dashboard methods failed, using default values');
        // Create default dashboard data if everything fails
        const defaultDashboard: UserDashboard = {
          user_id: user.id,
          full_name: user.full_name || 'User',
          current_day: currentDay,
          total_points: 0,
          streak_days: 0,
          total_inputs: 0,
          complete_inputs: 0,
          medication_days: 0,
          treatment_phase: treatmentPhase,
          last_data_input_date: undefined,
        };
        setUserData(defaultDashboard);
      }

      // Get today's input status
      try {
        const todayStatus = await DailyInputService.getTodayInputStatus();
        setTodayInputStatus(todayStatus);
      } catch (inputError) {
        console.error('Get today input status error:', inputError);
        // Set default status
        setTodayInputStatus({
          hasInput: false,
          isComplete: false,
          pointsEarned: 0,
        });
      }
        

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
      router.push('/(protected)/camera-verification' as any);
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
                Selamat datang kembali
              </Text>
              <Text className="text-white font-kollektif text-lg font-bold text-center">
                {currentUser?.nickname || currentUser?.full_name || 'Pengguna'}
              </Text>
            </View>

            {/* Treatment Progress Card */}
            <View className="bg-white rounded-3xl p-6 mx-4 shadow-lg">
              <View className="items-center">
                <Text className="text-smar-green font-kollektif text-4xl font-bold mb-2">
                  Hari {daysSinceRegistration}
                </Text>
                <Text className="text-gray-600 font-kollektif text-base mb-4">
                  Pengobatan Fase {userData?.treatment_phase || 'Intensif'}
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


                {/* Lungs illustration area */}
                <View className="h-32 w-32 bg-gray-100 rounded-full items-center justify-center mb-6">
                  <Ionicons name="fitness" size={48} color="#22C55E" />
                </View>

                <Text className="text-gray-600 font-kollektif text-sm text-center mb-6">
                  Semangat menumbuhkan pohon paru-paru!
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
                  <Image 
                    source={require('../../assets/images/png/community.png')} 
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
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
                  <Image 
                    source={require('../../assets/images/png/settings.png')} 
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
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
