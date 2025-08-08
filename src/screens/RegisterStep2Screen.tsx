import { Button, DateInput, Dropdown, DropdownOption, InputField, MultilineInput } from '@/src/components';
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

    // Comorbidities is optional, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      // TODO: Combine with step 1 data and implement actual registration logic
      console.log('Step 2 form data:', formData);
      
      // Show success message then navigate to dashboard
      // TODO: Implement real auth registration
      alert('Registrasi berhasil! Selamat datang di SMARTB.');
      router.replace('/(protected)/dashboard' as any);
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
