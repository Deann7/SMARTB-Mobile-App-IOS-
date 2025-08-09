import { Button, DateInput, Dropdown, DropdownOption, InputField, MultilineInput } from '@/src/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthService } from '../services/authService';

// TB Type options
const tbTypeOptions: DropdownOption[] = [
  { label: 'TB Paru', value: 'tb_paru' },
  { label: 'TB Ekstra Paru', value: 'tb_ekstra_paru' },
  { label: 'TB MDR (Multi Drug Resistant)', value: 'tb_mdr' },
  { label: 'TB XDR (Extensively Drug Resistant)', value: 'tb_xdr' },
  { label: 'TB Laten', value: 'tb_laten' },
];

// Drug Combination options
const drugCombinationOptions: DropdownOption[] = [
  { label: 'RHZE (Rifampisin, Isoniazid, Pyrazinamide, Ethambutol)', value: 'rhze' },
  { label: 'RHZ (Rifampisin, Isoniazid, Pyrazinamide)', value: 'rhz' },
  { label: 'RH (Rifampisin, Isoniazid)', value: 'rh' },
  { label: 'Streptomisin + RHZE', value: 'streptomisin_rhze' },
  { label: 'Levofloxacin + RHZE', value: 'levofloxacin_rhze' },
  { label: 'Kombinasi Khusus MDR', value: 'mdr_combination' },
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

interface RegisterStep2FormData {
  healthFacility: string;
  doctorName: string;
  diagnosisDate: {
    day: string;
    month: string;
    year: string;
  };
  tbType: string;
  medicationCombination: string;
  comorbidities: string;
}

export const RegisterStep2Screen: React.FC = () => {
  const [step1Data, setStep1Data] = useState<RegisterStep1FormData | null>(null);
  const [formData, setFormData] = useState<RegisterStep2FormData>({
    healthFacility: '',
    doctorName: '',
    diagnosisDate: {
      day: '',
      month: '',
      year: '',
    },
    tbType: '',
    medicationCombination: '',
    comorbidities: '',
  });
  const [errors, setErrors] = useState<Partial<Omit<RegisterStep2FormData, 'diagnosisDate'> & { diagnosisDate: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStep1Data();
  }, []);

  const loadStep1Data = async () => {
    try {
      const step1DataString = await AsyncStorage.getItem('registerStep1Data');
      if (step1DataString) {
        const data = JSON.parse(step1DataString);
        setStep1Data(data);
      }
    } catch (error) {
      console.error('Error loading step 1 data:', error);
    }
  };

  const handleInputChange = (field: keyof Omit<RegisterStep2FormData, 'diagnosisDate'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (value: { day: string; month: string; year: string }) => {
    setFormData((prev) => ({ ...prev, diagnosisDate: value }));
    // Clear error when user starts typing
    if (errors.diagnosisDate) {
      setErrors((prev) => ({ ...prev, diagnosisDate: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<RegisterStep2FormData, 'diagnosisDate'> & { diagnosisDate: string }> = {};

    if (!formData.healthFacility.trim()) {
      newErrors.healthFacility = 'Fasilitas kesehatan harus diisi';
    }

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Nama dokter harus diisi';
    }

    if (!formData.diagnosisDate.day.trim() || !formData.diagnosisDate.month.trim() || !formData.diagnosisDate.year.trim()) {
      newErrors.diagnosisDate = 'Tanggal diagnosis harus diisi lengkap';
    } else {
      // Basic date validation
      const day = parseInt(formData.diagnosisDate.day);
      const month = parseInt(formData.diagnosisDate.month);
      const year = parseInt(formData.diagnosisDate.year);
      
      if (day < 1 || day > 31) {
        newErrors.diagnosisDate = 'Hari tidak valid (1-31)';
      } else if (month < 1 || month > 12) {
        newErrors.diagnosisDate = 'Bulan tidak valid (1-12)';
      } else if (year < 1900 || year > new Date().getFullYear()) {
        newErrors.diagnosisDate = 'Tahun tidak valid';
      }
    }

    if (!formData.tbType) {
      newErrors.tbType = 'Jenis TB harus dipilih';
    }

    if (!formData.medicationCombination) {
      newErrors.medicationCombination = 'Kombinasi obat harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    if (!step1Data) {
      Alert.alert('Error', 'Data step 1 tidak ditemukan. Silakan kembali ke step 1.');
      return;
    }

    try {
      setLoading(true);
      
      // Use password from step 1 data
      const password = step1Data.password || `${step1Data.email.split('@')[0]}${step1Data.nationalId.slice(-4)}`;

      // Format dates
      const dateOfBirth = `${step1Data.dateOfBirth.year}-${step1Data.dateOfBirth.month.padStart(2, '0')}-${step1Data.dateOfBirth.day.padStart(2, '0')}`;
      const diagnosisDate = `${formData.diagnosisDate.year}-${formData.diagnosisDate.month.padStart(2, '0')}-${formData.diagnosisDate.day.padStart(2, '0')}`;

      // Prepare user data for registration
      const userData = {
        email: step1Data.email,
        password: password,
        full_name: step1Data.fullName,
        phone: step1Data.phoneNumber,
        date_of_birth: dateOfBirth,
        gender: step1Data.gender,
        national_id: step1Data.nationalId,
        treatment_start_date: diagnosisDate,
        health_facility: formData.healthFacility,
        doctor_name: formData.doctorName,
        tb_type: formData.tbType,
        medication_combination: formData.medicationCombination,
        comorbidities: formData.comorbidities,
      };

      console.log('Attempting registration with data:', userData);

      // Call the registration and sign-in service
      const result = await AuthService.signUpAndSignIn(userData);
      
      console.log('Registration and sign-in result:', result);
      
      // Verify session was created
      const session = await AuthService.verifySession(5, 1000);
      
      if (session || result.user || result.session) {
        // Clear stored step 1 data
        await AsyncStorage.removeItem('registerStep1Data');
        
        // Show success message
        Alert.alert(
          'Registrasi Berhasil!',
          `Selamat datang di SMARTB!\n\nEmail: ${step1Data.email}\nPassword: ${password}\n\nHarap simpan informasi login Anda.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(protected)/dashboard' as any),
            },
          ]
        );
      } else {
        throw new Error('Registration failed - no user or session returned');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Gagal mendaftar. Silakan coba lagi.';
      
      if (error?.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'Email sudah terdaftar. Silakan login atau gunakan email lain.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Format email tidak valid.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
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
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-3xl font-kollektif font-bold text-smar-green mb-2">
                Informasi Medis
              </Text>
              <Text className="text-smar-green font-kollektif text-base text-center">
                Langkah 2 dari 2 - Data Kesehatan
              </Text>
              
              {/* Progress Bar */}
              <View className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <View className="bg-smar-green h-2 rounded-full w-full" />
              </View>
            </View>

            {/* Form Fields */}
            <View className="mb-6">
              <InputField
                label="Fasilitas Kesehatan"
                placeholder="Nama rumah sakit/puskesmas"
                value={formData.healthFacility}
                onChangeText={(text: string) => handleInputChange('healthFacility', text)}
                error={errors.healthFacility}
              />

              <InputField
                label="Nama Dokter"
                placeholder="Nama dokter yang menangani"
                value={formData.doctorName}
                onChangeText={(text: string) => handleInputChange('doctorName', text)}
                error={errors.doctorName}
              />

              <DateInput
                label="Tanggal Diagnosis"
                value={formData.diagnosisDate}
                onChange={handleDateChange}
                error={errors.diagnosisDate}
              />

              <Dropdown
                label="Jenis TB"
                placeholder="Pilih jenis TB"
                options={tbTypeOptions}
                value={formData.tbType}
                onSelect={(value: string) => handleInputChange('tbType', value)}
                error={errors.tbType}
              />

              <Dropdown
                label="Kombinasi Obat yang Diberikan"
                placeholder="Pilih kombinasi obat"
                options={drugCombinationOptions}
                value={formData.medicationCombination}
                onSelect={(value: string) => handleInputChange('medicationCombination', value)}
                error={errors.medicationCombination}
              />

              <MultilineInput
                label="Penyakit Lain yang Dimiliki (Opsional)"
                placeholder="Tuliskan penyakit penyerta atau komorbiditas yang Anda miliki, jika ada..."
                value={formData.comorbidities}
                onChangeText={(text: string) => handleInputChange('comorbidities', text)}
                numberOfLines={4}
              />
            </View>

            {/* Action Buttons */}
            <View className="space-y-4">
              <Button
                title="Selesaikan Pendaftaran"
                onPress={handleRegister}
                variant="primary"
                loading={loading}
              />

              <TouchableOpacity 
                onPress={handleBack}
                className="items-center py-2"
              >
                <Text className="text-smar-green font-kollektif text-base">
                  Kembali ke Step 1
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions */}
            <View className="mt-6 p-4 bg-white rounded-xl">
              <Text className="font-kollektif text-xs text-gray-600 text-center">
                Dengan menyelesaikan pendaftaran, Anda menyetujui{' '}
                <Text className="text-smar-green font-medium">Syarat & Ketentuan</Text>
                {' '}dan{' '}
                <Text className="text-smar-green font-medium">Kebijakan Privasi</Text>
                {' '}SMAR-TB
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
