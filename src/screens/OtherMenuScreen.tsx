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

export const OtherMenuScreen: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const handleMenuPress = (menuName: string) => {
    console.log(`Navigating to ${menuName} page`);
    
    switch (menuName) {
      case 'Pengaturan':
        router.push('/(protected)/settings' as any);
        break;
      case 'Tentang TB':
        router.push('/(protected)/about-tb' as any);
        break;
      case 'Komunitas TB':
        router.push('/(protected)/community' as any);
        break;
      case 'Konsultasi':
        router.push('/(protected)/consultation' as any);
        break;
      case 'Input Data Minum Obat':
        router.push('/(protected)/camera-verification' as any);
        break;
      default:
        console.log(`Navigation for ${menuName} not implemented yet`);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

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

  useEffect(() => {
    loadUserName();
  }, []); 

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2D5A4F" />
      <SafeAreaView className="flex-1 bg-[#f1f8f5] p-4">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <TouchableOpacity
              onPress={handleBackPress}
              className="top-10 left-6 z-10"
              activeOpacity={0.8}
            >
              <View className="">
                <Text className="text-black font-bold font-kollektif text-2xl">←</Text>
              </View>
            </TouchableOpacity>
        
          <View className="px-3 pt-4 pb-4 relative">        

            {/* Header Content */}
            <View className="flex-row items-center justify-between mt-6 px-2">
              <View className="bg-smar-green p-4 max-w-full rounded-3xl flex-1">
                <Text className="text-white font-kollektif text-md font-bold text-center">
                  Selamat datang kembali
                </Text>
                <Text className="text-white font-kollektif text-3xl font-bold text-center">
                  {currentUser?.nickname || currentUser?.full_name || 'User'}
                </Text>
              </View>
              <Image
                source={require('../../assets/images/png/icon.png')}
                className="w-32 h-32"
              />
            </View>
          </View>

          {/* Menu Grid Section */}
          <View className="flex-1 px-3 py-4">
            <View className='h-full justify-center items-center'>

      
            <View className="flex-row flex-wrap justify-between">
              {/* Tentang TB */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Tentang TB')}
                className="border-2 border-[#1c4735] rounded-xl p-2 mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/about-tb.png')}
                    style={{ width: 72, height: 72 }}
                    />
                  <Text className="text-[#1c4735] font-kollektif text-base font-medium text-center mt-3">
                    Tentang TB
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Pengaturan */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Pengaturan')}
                className="border-2 border-[#1c4735] rounded-xl p-2 mb-4"
                style={{ width: '48%' }}
                activeOpacity={1}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/settings.png')}
                    style={{ width: 72, height: 72 }}
      
                  />
                  <Text className="text-[#1c4735] font-kollektif text-base font-medium text-center mt-3">
                    Pengaturan
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Komunitas TB */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Komunitas TB')}
                className="border-2 border-[#1c4735]  rounded-xl p-2 mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/community.png')}
                    style={{ width: 72, height: 72 }}
                   
                  />
                  <Text className="text-[#1c4735] font-kollektif text-base font-medium text-center mt-3">
                    Komunitas TB
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Konsultasi */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Konsultasi')}
                className="border-2 border-[#1c4735]  rounded-xl p-2 mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/consultation.png')}
                      style={{ width: 72, height: 72 }}
                   
                  />
                  <Text className="text-[#1c4735] font-kollektif text-base font-medium text-center mt-3">
                    Konsultasi
                  </Text>
                </View>
              </TouchableOpacity>

              </View>
            
            </View>
          </View>

          {/* Back Button at Bottom */}
          <View className="items-center pb-4">
            <TouchableOpacity
              onPress={handleBackPress}
              className="absolute left-4 bottom-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-kollektif text-lg">←</Text>
            </TouchableOpacity>
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
