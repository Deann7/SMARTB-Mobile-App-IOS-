import { Button, DateInput, Dropdown, DropdownOption, InputField } from '@/src/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Gender options
const genderOptions: DropdownOption[] = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' },
];

interface RegisterStep1FormData {
  fullName: string;
  nickname: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  phoneNumber: string;
  email: string;
  nationalId: string;
  gender: string;
  password: string;
}

export const RegisterStep1Screen: React.FC = () => {
  const [formData, setFormData] = useState<RegisterStep1FormData>({
    fullName: '',
    nickname: '',
    dateOfBirth: {
      day: '',
      month: '',
      year: '',
    },
    phoneNumber: '',
    email: '',
    nationalId: '',
    gender: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Omit<RegisterStep1FormData, 'dateOfBirth'> & { dateOfBirth: string }>>({});

  const handleInputChange = (field: keyof Omit<RegisterStep1FormData, 'dateOfBirth'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (value: { day: string; month: string; year: string }) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: value }));
    // Clear error when user starts typing
    if (errors.dateOfBirth) {
      setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<RegisterStep1FormData, 'dateOfBirth'> & { dateOfBirth: string }> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nama panggilan harus diisi';
    }

    if (!formData.dateOfBirth.day.trim() || !formData.dateOfBirth.month.trim() || !formData.dateOfBirth.year.trim()) {
      newErrors.dateOfBirth = 'Tanggal lahir harus diisi lengkap';
    } else {
      // Basic date validation
      const day = parseInt(formData.dateOfBirth.day);
      const month = parseInt(formData.dateOfBirth.month);
      const year = parseInt(formData.dateOfBirth.year);
      
      if (day < 1 || day > 31) {
        newErrors.dateOfBirth = 'Hari tidak valid (1-31)';
      } else if (month < 1 || month > 12) {
        newErrors.dateOfBirth = 'Bulan tidak valid (1-12)';
      } else if (year < 1900 || year > new Date().getFullYear()) {
        newErrors.dateOfBirth = 'Tahun tidak valid';
      }
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nomor telepon harus diisi';
    } else if (formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Nomor telepon minimal 10 digit';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'NIK harus diisi';
    } else if (formData.nationalId.length !== 16) {
      newErrors.nationalId = 'NIK harus 16 digit';
    }

    if (!formData.gender) {
      newErrors.gender = 'Jenis kelamin harus dipilih';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateForm()) {
      try {
        // Store step 1 data in AsyncStorage
        await AsyncStorage.setItem('registerStep1Data', JSON.stringify(formData));
        console.log('Step 1 form data:', formData);
        // Navigate to step 2
        router.push('/(auth)/register-step-2' as any);
      } catch (error) {
        console.error('Error storing step 1 data:', error);
        // Still navigate to step 2 even if storage fails
        router.push('/(auth)/register-step-2' as any);
      }
    }
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
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-3xl font-kollektif font-bold text-smar-green mb-2">
                Daftar Akun
              </Text>
              <Text className="text-smar-green font-kollektif text-base text-center">
                Langkah 1 dari 2 - Data Pribadi
              </Text>
              
              {/* Progress Bar */}
              <View className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <View className="bg-smar-green h-2 rounded-full w-1/2" />
              </View>
            </View>

            {/* Form Fields */}
            <View className="mb-6">
              <InputField
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap sesuai KTP"
                value={formData.fullName}
                onChangeText={(text: string) => handleInputChange('fullName', text)}
                error={errors.fullName}
              />

              <InputField
                label="Nama Panggilan"
                placeholder="Nama yang biasa dipanggil"
                value={formData.nickname}
                onChangeText={(text: string) => handleInputChange('nickname', text)}
                error={errors.nickname}
              />

              <DateInput
                label="Tanggal Lahir"
                value={formData.dateOfBirth}
                onChange={handleDateChange}
                error={errors.dateOfBirth}
              />

              <Dropdown
                label="Jenis Kelamin"
                placeholder="Pilih jenis kelamin"
                options={genderOptions}
                value={formData.gender}
                onSelect={(value: string) => handleInputChange('gender', value)}
                error={errors.gender}
              />

              <InputField
                label="Nomor Telepon"
                placeholder="Contoh: 08123456789"
                value={formData.phoneNumber}
                onChangeText={(text: string) => handleInputChange('phoneNumber', text)}
                keyboardType="phone-pad"
                error={errors.phoneNumber}
              />

              <InputField
                label="Email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChangeText={(text: string) => handleInputChange('email', text)}
                keyboardType="email-address"
                error={errors.email}
              />

              <InputField
                label="NIK (Nomor Induk Kependudukan)"
                placeholder="16 digit sesuai KTP"
                value={formData.nationalId}
                onChangeText={(text: string) => handleInputChange('nationalId', text)}
                keyboardType="numeric"
                error={errors.nationalId}
              />

              <InputField
                label="Password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChangeText={(text: string) => handleInputChange('password', text)}
                secureTextEntry={true}
                error={errors.password}
              />
            </View>

            {/* Action Button */}
            <Button
              title="Lanjutkan ke Step 2"
              onPress={handleNext}
              variant="primary"
            />

            {/* Back to Login Link */}
            <View className="mt-4 items-center">
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/login')}
                className="py-2"
              >
                <Text className="text-smar-green font-kollektif text-sm">
                  Sudah punya akun? Masuk di sini
                </Text>
              </TouchableOpacity>
            </View>

            {/* Step Info */}
            <View className="mt-6 p-4 bg-white rounded-xl">
              <Text className="font-kollektif text-sm text-gray-600 text-center">
                Pastikan data yang Anda masukkan sesuai dengan{'\n'}
                identitas resmi untuk verifikasi akun
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
