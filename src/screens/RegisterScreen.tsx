import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, InputField } from '../components';

interface RegisterFormData {
  email: string;
  password: string;
}

export const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email atau nomor telepon harus diisi';
    } else if (!formData.email.includes('@') && formData.email.length < 10) {
      newErrors.email = 'Format email atau nomor telepon tidak valid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Kata sandi harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      // TODO: Implement actual registration logic
      console.log('Register form data:', formData);
      // For now, just navigate to home or login
      router.push('/(protected)/dashboard');
    }
  };

  const handlePatientRegister = () => {
    // Navigate to patient registration flow
    console.log('Navigate to patient registration');
  };

  const handleFamilyRegister = () => {
    // Navigate to family member registration flow
    console.log('Navigate to family member registration');
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
            {/* Header with Logo */}
            <View className="items-center mb-8">
              <View className="flex-row items-center justify-center mb-6">
                {/* Lung and Pills Illustration */}
                <View className="relative">
                  <View className="flex-row items-center">
                    {/* Left Lung */}
                    <View className="w-16 h-20 bg-red-300 rounded-l-full rounded-r-lg mr-1" />
                    {/* Trachea */}
                    <View className="w-2 h-12 bg-yellow-200 absolute left-8 -top-2" />
                    {/* Right Lung */}
                    <View className="w-16 h-20 bg-red-300 rounded-r-full rounded-l-lg ml-1" />
                    {/* Pills */}
                    <View className="absolute -right-4 top-2 bg-red-200 rounded-lg p-2 rotate-12">
                      <View className="flex-row flex-wrap w-8">
                        {[...Array(8)].map((_, i) => (
                          <View 
                            key={i} 
                            className="w-2 h-2 bg-red-400 rounded-full m-0.5" 
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Title */}
              <Text className="text-4xl font-kollektif font-bold text-smar-green mb-2">
                SMAR-TB
              </Text>
            </View>

            {/* Form Fields */}
            <View className="mb-6">
              <InputField
                placeholder="E-mail atau Nomor Telepon"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                error={errors.email}
              />

              <InputField
                placeholder="Kata Sandi"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
                error={errors.password}
              />
            </View>

            {/* Action Buttons */}
            <View className="space-y-4">
              <Button
                title="Daftar Sebagai Pasien"
                onPress={handlePatientRegister}
                variant="primary"
              />

              <Button
                title="Daftar Sebagai Keluarga Pasien"
                onPress={handleFamilyRegister}
                variant="secondary"
              />
            </View>

            {/* Login Link */}
            <View className="flex-1 justify-end mt-8">
              <TouchableOpacity 
                onPress={() => router.navigate('/(auth)/login' as any)}
                className="items-center"
              >
                <Text className="text-smar-green font-kollektif text-base">
                  Sudah punya akun? <Text className="font-semibold">Masuk</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
