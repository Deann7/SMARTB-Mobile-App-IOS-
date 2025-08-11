import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, InputField } from '../components';
import { AuthService } from '../services/authService';

interface LoginFormData {
  phone: string; // Changed from email to phone
  password: string;
}

export const LoginScreen: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    phone: '',
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

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Nomor telepon minimal 10 digit';
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
      
      // Attempt to sign in with phone number
      await AuthService.signIn(formData.phone.trim(), formData.password);
      
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
        if (error.message.includes('Nomor telepon atau password salah')) {
          errorMessage = 'Nomor telepon atau kata sandi salah. Silakan coba lagi.';
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
      <SafeAreaView className="flex-1 bg-green-100/90">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-6 pb-4">
            {/* Header with Logo */}
            <View className="items-center mb-2">
            <Image 
              source={require('../../assets/images/png/icon.png')}
              className="w-64 h-64"
            />
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
            <View className="mb-3 rounded-full ">
              <InputField
                placeholder="Nomor Telepon"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                keyboardType="phone-pad"
                error={errors.phone}
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
            <View className="space-y-4 rounded-full">
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
