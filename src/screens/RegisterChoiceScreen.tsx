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

export const RegisterChoiceScreen: React.FC = () => {
  const handlePatientRegistration = () => {
    // Navigate to patient registration step 1
    router.push('/(auth)/register-step-1' as any);
  };


  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <SafeAreaView className="flex-1 bg-smar-light">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-8 pb-6">
            {/* Header with Back Button */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
                <Ionicons name="arrow-back" size={24} color="#2D5A4F" />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-2xl font-kollektif font-bold text-smar-green mr-10">
                Pilih Jenis Akun
              </Text>
            </View>

            {/* Header Description */}
            <View className="items-center mb-12">
              <Text className="text-smar-green font-kollektif text-base text-center mb-2">
                Silakan pilih jenis akun yang sesuai dengan kebutuhan Anda
              </Text>
            </View>

            {/* Registration Options */}
            <View className="space-y-6">
              {/* Patient Registration */}
              <TouchableOpacity
                onPress={handlePatientRegistration}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 active:bg-gray-50"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-smar-green/10 rounded-full items-center justify-center mr-4">
                    <Ionicons name="person" size={32} color="#2D5A4F" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-kollektif font-bold text-smar-green mb-2">
                      Daftar sebagai Pasien
                    </Text>
                    <Text className="text-gray-600 font-kollektif text-sm leading-5">
                      Untuk pasien TB yang ingin memantau pengobatan dan berkonsultasi dengan dokter
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#2D5A4F" />
                </View>
              </TouchableOpacity>
             
            </View>

            {/* Bottom Info */}
            <View className="mt-12 p-4 bg-smar-accent/10 rounded-xl">
              <Text className="text-smar-green font-kollektif text-sm text-center leading-5">
                Sudah punya akun?{' '}
                <Text 
                  className="font-bold underline"
                  onPress={() => router.replace('/(auth)/login')}
                >
                  Masuk di sini
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
