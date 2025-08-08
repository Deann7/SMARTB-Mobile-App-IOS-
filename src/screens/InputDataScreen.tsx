import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Dropdown, InputField, MultilineInput } from '../components';

interface DailyInputFormData {
  medicationTaken: string;
  sideEffects: string;
  symptoms: string;
  weight: string;
  notes: string;
}

const medicationOptions = [
  { label: 'Ya, tepat waktu', value: 'on_time' },
  { label: 'Ya, terlambat', value: 'late' },
  { label: 'Tidak minum obat', value: 'missed' },
];

const sideEffectsOptions = [
  { label: 'Tidak ada', value: 'none' },
  { label: 'Mual', value: 'nausea' },
  { label: 'Muntah', value: 'vomiting' },
  { label: 'Pusing', value: 'dizzy' },
  { label: 'Lainnya', value: 'other' },
];

const symptomsOptions = [
  { label: 'Tidak ada', value: 'none' },
  { label: 'Batuk', value: 'cough' },
  { label: 'Demam', value: 'fever' },
  { label: 'Sesak napas', value: 'shortness_of_breath' },
  { label: 'Nyeri dada', value: 'chest_pain' },
  { label: 'Lainnya', value: 'other' },
];

export const InputDataScreen: React.FC = () => {
  const [formData, setFormData] = useState<DailyInputFormData>({
    medicationTaken: '',
    sideEffects: '',
    symptoms: '',
    weight: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<DailyInputFormData>>({});

  const handleInputChange = (field: keyof DailyInputFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DailyInputFormData> = {};

    if (!formData.medicationTaken) {
      newErrors.medicationTaken = 'Status minum obat harus dipilih';
    }

    if (!formData.sideEffects) {
      newErrors.sideEffects = 'Status efek samping harus dipilih';
    }

    if (!formData.symptoms) {
      newErrors.symptoms = 'Status gejala harus dipilih';
    }

    if (!formData.weight.trim()) {
      newErrors.weight = 'Berat badan harus diisi';
    } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      newErrors.weight = 'Berat badan harus berupa angka positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // TODO: Implement API call to save daily data
      console.log('Daily input data:', formData);
      
      Alert.alert(
        'Data Tersimpan',
        'Data harian Anda berhasil disimpan!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      <SafeAreaView className="flex-1 bg-smar-light">
        {/* Header */}
        <View className="bg-smar-green px-6 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleBack} className="p-2">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-kollektif text-lg font-bold">
              Input Data Harian
            </Text>
            <View className="w-8" />
          </View>
          <Text className="text-white font-kollektif text-sm text-center mt-2">
            {currentDate}
          </Text>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-6 pb-6">
            {/* Instructions */}
            <View className="bg-smar-accent/10 p-4 rounded-lg mb-6">
              <Text className="text-smar-green font-kollektif text-sm text-center">
                Isi data harian Anda dengan lengkap untuk membantu monitoring kesehatan
              </Text>
            </View>

            {/* Form Fields */}
            <View className="mb-6">
              <Dropdown
                label="Status Minum Obat Hari Ini"
                placeholder="Pilih status minum obat"
                options={medicationOptions}
                value={formData.medicationTaken}
                onSelect={(value) => handleInputChange('medicationTaken', value)}
                error={errors.medicationTaken}
              />

              <Dropdown
                label="Efek Samping yang Dirasakan"
                placeholder="Pilih efek samping"
                options={sideEffectsOptions}
                value={formData.sideEffects}
                onSelect={(value) => handleInputChange('sideEffects', value)}
                error={errors.sideEffects}
              />

              <Dropdown
                label="Gejala yang Dirasakan"
                placeholder="Pilih gejala"
                options={symptomsOptions}
                value={formData.symptoms}
                onSelect={(value) => handleInputChange('symptoms', value)}
                error={errors.symptoms}
              />

              <InputField
                label="Berat Badan (kg)"
                placeholder="Masukkan berat badan"
                value={formData.weight}
                onChangeText={(text: string) => handleInputChange('weight', text)}
                keyboardType="numeric"
                error={errors.weight}
              />

              <MultilineInput
                label="Catatan Tambahan (Opsional)"
                placeholder="Tambahkan catatan jika ada hal khusus yang ingin disampaikan"
                value={formData.notes}
                onChangeText={(text: string) => handleInputChange('notes', text)}
                numberOfLines={4}
              />
            </View>

            {/* Submit Button */}
            <View className="mt-6">
              <Button
                title="Simpan Data Harian"
                onPress={handleSubmit}
                variant="primary"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
