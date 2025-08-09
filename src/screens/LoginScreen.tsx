import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, InputField } from '../components';
import { AuthService } from '../services/authService';

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
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Attempt to sign in with Supabase
      await AuthService.signIn(formData.email.trim(), formData.password);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Login Berhasil',
        text2: 'Selamat datang kembali!',
        position: 'top',
        visibilityTime: 2000,
      });

      // Navigate to dashboard after successful login
      setTimeout(() => {
        router.replace('/(protected)/dashboard' as any);
      }, 1000);

    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Gagal masuk. Silakan coba lagi.';
      
      if (error?.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email atau kata sandi salah. Silakan coba lagi.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email belum dikonfirmasi. Silakan cek email Anda.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit.';
        } else {
          errorMessage = error.message;
        }
      }

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Login Gagal',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
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
                editable={!loading}
              />

              <InputField
                placeholder="Kata Sandi"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
                error={errors.password}
                editable={!loading}
              />
            </View>

            {/* Action Buttons */}
            <View className="space-y-4">
              <Button
                title={loading ? "Memproses..." : "Masuk"}
                onPress={handleLogin}
                variant="primary"
                disabled={loading}
              />
              {loading && (
                <View className="items-center mt-4">
                  <ActivityIndicator size="small" color="#2D5A4F" />
                </View>
              )}
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
                  disabled={loading}
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
