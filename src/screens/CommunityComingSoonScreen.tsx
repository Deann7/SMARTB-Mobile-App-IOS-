import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { User } from '../lib/supabase';
import { AuthService } from '../services/authService';

export const CommunityComingSoonScreen: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        console.log('Current user loaded:', user);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f8f5" />
      <SafeAreaView className="flex-1 bg-[#f1f8f5]">
        <View className="flex-1 px-4 py-4">
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
          {/* Header Section with Back Button */}
          <View className="pt-4 pb-4 relative">
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBackPress}
              className="absolute top-4 left-2 z-10"
              activeOpacity={0.8}
            >
              <Text className="text-black font-bold font-kollektif text-2xl">←</Text>
            </TouchableOpacity>

            {/* Header Content */}
            <View className="flex-row items-center justify-between mt-6 px-2">
              <View className="bg-smar-green p-6 max-w-64 rounded-3xl flex-1">
                <Text className="text-white font-kollektif text-2xl font-bold text-center">
                  Komunitas TB
                </Text>
              </View>
              <Image
                source={require('../../assets/images/png/community.png')}
                className="w-32 h-32"
              />
            </View>
          </View>

          {/* Coming Soon Content */}
          <View className="flex-1 py-4">
            <View className='h-full justify-center items-center'>
              
              {/* Coming Soon Message */}
              <View className="items-center mb-8">
                <Image 
                  source={require('../../assets/images/png/community.png')}
                  style={{ width: 120, height: 120 }}
                  className="mb-6"
                />
                
                <Text className="text-[#1c4735] font-kollektif text-2xl font-bold text-center mb-4">
                  Segera Hadir!
                </Text>
                
                <Text className="text-[#1c4735] font-kollektif text-base text-center mb-2 px-4">
                  Fitur Komunitas TB sedang dalam pengembangan
                </Text>
                
                <Text className="text-gray-600 font-kollektif text-sm text-center px-6 leading-6">
                  Kami sedang mempersiapkan platform yang aman dan mendukung untuk berbagi pengalaman, tips, dan dukungan antar sesama penderita TB.
                </Text>
              </View>

           
              {/* Back Button */}
              <TouchableOpacity
                onPress={handleBackPress}
                className="bg-smar-green px-8 py-3 rounded-lg"
                activeOpacity={0.8}
              >
                <Text className="text-white font-kollektif text-base font-semibold">
                  Kembali ke Menu
                </Text>
              </TouchableOpacity>
              
            </View>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="text-smar-green font-kollektif text-sm">
              SMARTB
            </Text>
          </View>
                  </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};
