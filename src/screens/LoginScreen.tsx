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

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email atau nomor telepon harus diisi';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Kata sandi harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      // TODO: Implement actual login logic
      console.log('Login form data:', formData);
      // After successful login, navigate to dashboard
      router.replace('/(protected)/dashboard' as any);
    }
  };

  const handleCreateAccount = () => {
    // Navigate to register choice screen
    router.push('/(auth)/register' as any);
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
                    <View className="absolute -right-4 top-2 bg-blue-200 rounded-lg p-2 rotate-12">
                      <View className="flex-row flex-wrap w-8">
                        {[...Array(8)].map((_, i) => (
                          <View 
                            key={i} 
                            className="w-2 h-2 bg-smar-blue rounded-full m-0.5" 
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
              
              {/* Welcome Message */}
              <Text className="text-smar-green font-kollektif text-base text-center mb-8">
                Selamat Datang!{'\n'}Silakan Masuk dengan Akun Anda
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
                title="Masuk"
                onPress={handleLogin}
                variant="primary"
              />
            </View>

            {/* Create Account Link */}
            <View className="flex-1 justify-end mt-8">
              <View className="items-center mb-4">
                <Text className="text-gray-600 font-kollektif text-sm text-center mb-2">
                  Belum punya akun?
                </Text>
                <TouchableOpacity 
                  onPress={handleCreateAccount}
                  className="bg-smar-green px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-kollektif text-base font-medium">
                    Daftar Sekarang
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
