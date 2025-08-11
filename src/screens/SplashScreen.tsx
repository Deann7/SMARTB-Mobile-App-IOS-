import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from 'react-native';

export const SplashScreen: React.FC = () => {
  useEffect(() => {
    // Auto-navigate to auth after 3 seconds (extended for testing)
    const timer = setTimeout(() => {
      router.replace('/(auth)/login' as any);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      <SafeAreaView className="flex-1 bg-green-500">
        <View className="flex-1 justify-center items-center px-6">
          {/* App Icon */}
          <View className="items-center mb-8">
            <Image 
              source={require('../../assets/images/png/icon.png')}
              className="w-52 h-52 mb-2"
              resizeMode="contain"
            />
            
            {/* App Title */}
            <Text className="text-6xl font-kollektif font-bold text-white mb-4">
              SMAR-TB
            </Text>
            
            {/* Subtitle */}
            <Text className="text-white font-kollektif text-lg text-center opacity-90">
              One Stop TB Solution
            </Text>
          </View>
        </View>

        {/* Loading indicator or version */}
        <View className="absolute bottom-12 items-center self-center">
          <View className="flex-row space-x-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <View 
                key={i}
                className="w-2 h-2 bg-white rounded-full opacity-60"
                style={{
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </View>
          <Text className="text-white font-kollektif text-sm opacity-60">
            Version 1.0.0
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
};
