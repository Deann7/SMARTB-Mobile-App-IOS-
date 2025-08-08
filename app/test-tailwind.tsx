import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function TestScreen() {
  return (
    <SafeAreaView className="flex-1 bg-red-500">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-4xl font-bold text-white mb-4">
          Tailwind Test
        </Text>
        <Text className="text-lg text-white mb-8 text-center">
          Jika Anda melihat teks putih di background merah, Tailwind sudah bekerja!
        </Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">
            Kembali
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
