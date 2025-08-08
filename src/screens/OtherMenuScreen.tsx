import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const OtherMenuScreen: React.FC = () => {
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
        // TODO: Navigate to TB Community page
        console.log('TB Community navigation not implemented yet');
        break;
      case 'Konsultasi':
        router.push('/(protected)/consultation' as any);
        break;
      default:
        console.log(`Navigation for ${menuName} not implemented yet`);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

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
          <View className="relative mb-6 mt-12">
            {/* Welcome Message Box */}
            <View className="bg-smar-green border-4 border-purple-500 rounded-lg p-6 mx-4">
              {/* Icon at the top */}
              <View className="items-center mb-2">
                <Image 
                  source={require('../../assets/images/png/icon.png')}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              </View>
              
              <Text className="text-white font-kollektif text-sm text-center">
                Selamat datang kembali
              </Text>
              <Text className="text-white font-kollektif text-2xl font-bold text-center">
                Putri
              </Text>
            </View>

            {/* Medical Illustrations */}
            <View className="flex-row justify-end items-center absolute top-8 right-8">
              {/* Lungs Illustration */}
              <View className="mr-3">
                <View className="w-12 h-12 bg-red-200 rounded-full items-center justify-center">
                  <Ionicons name="fitness" size={24} color="#DC2626" />
                </View>
              </View>
              
              {/* Inhaler Illustration */}
              <View className="mr-3">
                <View className="w-12 h-12 bg-gray-200 rounded-lg items-center justify-center">
                  <Ionicons name="medical-outline" size={24} color="#6B7280" />
                </View>
              </View>
              
              {/* Blister Pack Illustration */}
              <View>
                <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center">
                  <Ionicons name="medical" size={24} color="#2563EB" />
                </View>
              </View>
            </View>
          </View>

          {/* Menu Grid Section */}
          <View className="flex-1 px-3 py-4">
            <View className="flex-row flex-wrap justify-between">
              {/* Tentang TB */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Tentang TB')}
                className="bg-white border border-[#1c4735] rounded-xl p-4 shadow-sm mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/about-tb.png')}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                  <Text className="text-[#1c4735] font-kollektif text-base font-medium text-center mt-3">
                    Tentang TB
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Pengaturan */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Pengaturan')}
                className="bg-white border border-green-200 rounded-xl p-4 shadow-sm mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/settings.png')}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                  <Text className="text-gray-700 font-kollektif text-base font-medium text-center mt-3">
                    Pengaturan
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Komunitas TB */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Komunitas TB')}
                className="bg-white border border-green-200 rounded-xl p-4 shadow-sm mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/community.png')}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                  <Text className="text-gray-700 font-kollektif text-base font-medium text-center mt-3">
                    Komunitas TB
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Konsultasi */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Konsultasi')}
                className="bg-white border border-green-200 rounded-xl p-4 shadow-sm mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/consultation.png')}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                  <Text className="text-gray-700 font-kollektif text-base font-medium text-center mt-3">
                    Konsultasi
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back Button at Bottom */}
          <View className="items-center pb-4">
            <TouchableOpacity
              onPress={handleBackPress}
              className="bg-smar-green rounded-full p-3"
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