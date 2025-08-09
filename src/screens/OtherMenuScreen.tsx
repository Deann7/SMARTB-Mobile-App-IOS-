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
            
          </View>

          {/* Menu Grid Section */}
          <View className="flex-1 px-3 py-4">
            <View className='h-full justify-center items-center'>

      
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
                className="bg-white border border-[#1c4735] rounded-xl p-4 shadow-sm mb-4"
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
                className="bg-white border border-[#1c4735]  rounded-xl p-4 shadow-sm mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/community.png')}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                  <Text className="text-[#1c4735] font-kollektif text-base font-medium text-center mt-3">
                    Komunitas TB
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Konsultasi */}
              <TouchableOpacity
                onPress={() => handleMenuPress('Konsultasi')}
                className="bg-white border border-[#1c4735]  rounded-xl p-4 shadow-sm mb-4"
                style={{ width: '48%' }}
                activeOpacity={0.8}
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/images/png/consultation.png')}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
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