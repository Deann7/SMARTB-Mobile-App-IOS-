import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
    SafeAreaView,
    StatusBar,
    Text,
    View,
} from 'react-native';

export const SplashScreen: React.FC = () => {
  useEffect(() => {
    // Auto-navigate to login after 3 seconds
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
          {/* Tailwind Test */}
          <View className="bg-white p-8 rounded-lg shadow-lg mb-8">
            <Text className="text-2xl font-bold text-green-600 text-center mb-4">
              SMARTB
            </Text>
            <Text className="text-gray-600 text-center">
              Testing Tailwind CSS
            </Text>
          </View>
          
          {/* Simple Animation Area */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-4">
              <Text className="text-2xl">🫁</Text>
            </View>
            <Text className="text-white text-lg font-bold text-center">
              Sistem Monitoring TB
            </Text>
            <Text className="text-white text-sm text-center mt-2 opacity-90">
              Membantu pemantauan pengobatan tuberkulosis
            </Text>
          </View>

          {/* Loading indicator */}
          <View className="absolute bottom-12 items-center">
            <View className="flex-row space-x-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <View 
                  key={i}
                  className="w-2 h-2 bg-white rounded-full opacity-60"
                />
              ))}
            </View>
            <Text className="text-white text-sm opacity-60">
              Version 1.0.0
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};
