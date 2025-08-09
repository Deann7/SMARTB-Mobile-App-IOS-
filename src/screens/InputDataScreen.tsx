import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { DailyInput, DailyInputRequest } from '../lib/supabase';
import { DailyInputService } from '../services/dailyInputService';

interface SymptomData {
  symptoms: string[];
  coughDescription: string[];
  activities: string[];
  otherActivity: string;
  mood: number;
  mentalHealthSymptoms: string[];
}

export const InputDataScreen: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<DailyInput | null>(null);
  const [symptomData, setSymptomData] = useState<SymptomData>({
    symptoms: [],
    coughDescription: [],
    activities: [],
    otherActivity: '',
    mood: 3, // Default to neutral (middle)
    mentalHealthSymptoms: [],
  });

  const symptomsOptions = [
    'Batuk',
    'Nyeri Dada', 
    'Demam',
    'Keringat Malam',
    'Kelelahan',
    'Gejala Lainnya'
  ];

  const coughDescriptionOptions = [
    'Sepanjang hari',
    'Berkala',
    'Disertai dahak berwarna kuning atau hijau',
    'Disertai darah',
    'Tidak berdahak / batuk kering'
  ];

  const activitiesOptions = [
    'Olahraga 30 menit atau lebih',
    'Tidur 7-8 jam / hari',
    'Makan makanan sehat dan gizi seimbang',
    'Menggunakan masker saat bertemu orang lain',
    'Tidak merokok',
    'Lainnya'
  ];

  const mentalHealthOptions = [
    'Murung, muram atau putus asa',
    'Sulit tidur atau terlalu banyak tidur',
    'Kurang tertarik melakukan apapun',
    'Lelah atau kurang bertenaga',
    'Kurang nafsu makan atau terlalu banyak makan',
    'Kurang percaya diri',
    'Sulit berkonsentrasi',
    'Bergerak atau berbicara sangat lambat',
    'Ingin melukai diri'
  ];

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodColors = ['#FF4444', '#FF8C00', '#FFD700', '#90EE90', '#228B22'];

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingInput = await DailyInputService.getDailyInput(today);
      
      if (existingInput) {
        setExistingData(existingInput);
        setSymptomData({
          symptoms: existingInput.symptoms || [],
          coughDescription: existingInput.cough_description || [],
          activities: existingInput.activities || [],
          otherActivity: existingInput.other_activities || '',
          mood: existingInput.mood_rating,
          mentalHealthSymptoms: existingInput.mental_health_symptoms || [],
        });
      }
    } catch (error) {
      console.error('Load existing data error:', error);
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    setSymptomData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleCoughDescriptionToggle = (description: string) => {
    setSymptomData(prev => ({
      ...prev,
      coughDescription: prev.coughDescription.includes(description)
        ? prev.coughDescription.filter(d => d !== description)
        : [...prev.coughDescription, description]
    }));
  };

  const handleActivityToggle = (activity: string) => {
    setSymptomData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleMentalHealthToggle = (symptom: string) => {
    setSymptomData(prev => ({
      ...prev,
      mentalHealthSymptoms: prev.mentalHealthSymptoms.includes(symptom)
        ? prev.mentalHealthSymptoms.filter(s => s !== symptom)
        : [...prev.mentalHealthSymptoms, symptom]
    }));
  };

  const handleNext = () => {
    if (currentPage === 1) {
      if (symptomData.symptoms.length === 0) {
        Alert.alert('Peringatan', 'Silakan pilih minimal satu gejala');
        return;
      }
      setCurrentPage(2);
    } else if (currentPage === 2) {
      if (symptomData.coughDescription.length === 0) {
        Alert.alert('Peringatan', 'Silakan pilih minimal satu deskripsi batuk');
        return;
      }
      setCurrentPage(3);
    } else if (currentPage === 3) {
      if (symptomData.activities.length === 0) {
        Alert.alert('Peringatan', 'Silakan pilih minimal satu kegiatan');
        return;
      }
      if (symptomData.activities.includes('Lainnya') && symptomData.otherActivity.trim() === '') {
        Alert.alert('Peringatan', 'Silakan isi kegiatan lainnya');
        return;
      }
      setCurrentPage(4);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      const inputData: DailyInputRequest = {
        input_date: today,
        medication_taken: true, // Assuming medication is taken if user completes the form
        medication_time: new Date().toTimeString().split(' ')[0],
        symptoms: symptomData.symptoms,
        cough_description: symptomData.coughDescription,
        activities: symptomData.activities,
        mood_rating: symptomData.mood,
        mental_health_symptoms: symptomData.mentalHealthSymptoms,
        other_activities: symptomData.otherActivity,
      };

      await DailyInputService.submitDailyInput(inputData);
      
      // Navigate to conclusion page
      setCurrentPage(5);
    } catch (error) {
      console.error('Submit data error:', error);
      Alert.alert('Error', 'Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/(protected)/dashboard' as any);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      <SafeAreaView className="flex-1 bg-[#F5F5F5]">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="bg-green-100 px-6 pt-8 pb-6 rounded-b-3xl">
            <View className="flex-row justify-between items-center">
              {/* Home Icon */}
              <TouchableOpacity onPress={handleGoToDashboard} className="p-2">
                <Ionicons name="home" size={24} color="#2D5A4F" />
              </TouchableOpacity>
              
              {/* Day Counter */}
              <View className="bg-[#2D5A4F] rounded-lg px-4 py-2 border border-purple-500">
                <Text className="text-white font-kollektif text-lg font-bold">
                  HARI {existingData?.input_date ? new Date(existingData.input_date).getDate() : new Date().getDate()}
                </Text>
              </View>
              
              {/* Icons */}
              <View className="flex-row items-center">
                <Image 
                  source={require('../../assets/images/png/icon.png')} 
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Content */}
          <View className="flex-1 px-6 pt-6">
            {currentPage === 1 ? (
              // Page 1: Symptoms
              <View className="flex-1">
                <Text className="text-[#2D5A4F] font-kollektif text-lg text-center mb-8">
                  Gejala yang dialami kemarin
                </Text>

                <View>
                  {symptomsOptions.map((symptom, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSymptomToggle(symptom)}
                      className={`p-4 rounded-lg border-2 mb-4 ${
                        symptomData.symptoms.includes(symptom)
                          ? 'bg-pink-200 border-[#2D5A4F]'
                          : 'bg-pink-100 border-[#2D5A4F]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text className="text-[#2D5A4F] font-kollektif text-base text-center">
                        {symptom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="mt-8">
                  <TouchableOpacity
                    onPress={handleNext}
                    className="bg-[#2D5A4F] py-3 px-6 rounded-lg"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-kollektif text-base font-semibold text-center">
                      Lanjutkan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : currentPage === 2 ? (
              // Page 2: Cough Description
              <View className="flex-1">
                <Text className="text-[#2D5A4F] font-kollektif text-lg text-center mb-8">
                  Deskripsi batuk yang dialami
                </Text>

                <View>
                  {coughDescriptionOptions.map((description, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleCoughDescriptionToggle(description)}
                      className={`p-4 rounded-lg border-2 mb-4 ${
                        symptomData.coughDescription.includes(description)
                          ? 'bg-pink-200 border-[#2D5A4F]'
                          : 'bg-pink-100 border-[#2D5A4F]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text className="text-[#2D5A4F] font-kollektif text-base text-center">
                        {description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="mt-8">
                  <TouchableOpacity
                    onPress={handleBack}
                    className="bg-gray-300 py-3 px-6 rounded-lg mb-3"
                    activeOpacity={0.8}
                  >
                    <Text className="text-gray-700 font-kollektif text-base font-semibold text-center">
                      Kembali
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleNext}
                    className="bg-[#2D5A4F] py-3 px-6 rounded-lg"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-kollektif text-base font-semibold text-center">
                      Lanjutkan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : currentPage === 3 ? (
              // Page 3: Activities
              <View className="flex-1">
                <Text className="text-[#2D5A4F] font-kollektif text-lg text-center mb-8">
                  Kegiatan yang dilakukan hari ini
                </Text>

                <View>
                  {activitiesOptions.map((activity, index) => (
                    <View key={index} className="flex-row items-center mb-4">
                      <TouchableOpacity
                        onPress={() => handleActivityToggle(activity)}
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                          symptomData.activities.includes(activity)
                            ? 'bg-pink-300 border-[#2D5A4F]'
                            : 'bg-white border-[#2D5A4F]'
                        }`}
                        activeOpacity={0.7}
                      >
                        {symptomData.activities.includes(activity) && (
                          <View className="w-3 h-3 bg-[#2D5A4F] rounded-full" />
                        )}
                      </TouchableOpacity>
                      <View className="flex-1">
                        {activity === 'Lainnya' ? (
                          <View className="flex-row items-center">
                            <Text className="text-[#2D5A4F] font-kollektif text-base flex-1">
                              Lainnya:
                            </Text>
                            <TextInput
                              className="flex-1 border-b border-[#2D5A4F] px-2 py-1 font-kollektif text-base"
                              placeholder="___________"
                              value={symptomData.otherActivity}
                              onChangeText={(text) => setSymptomData(prev => ({ ...prev, otherActivity: text }))}
                              onFocus={() => {
                                if (!symptomData.activities.includes('Lainnya')) {
                                  handleActivityToggle('Lainnya');
                                }
                              }}
                            />
                          </View>
                        ) : (
                          <Text className="text-[#2D5A4F] font-kollektif text-base">
                            {activity}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                <View className="mt-8">
                  <TouchableOpacity
                    onPress={handleBack}
                    className="bg-gray-300 py-3 px-6 rounded-lg mb-3"
                    activeOpacity={0.8}
                  >
                    <Text className="text-gray-700 font-kollektif text-base font-semibold text-center">
                      Kembali
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleNext}
                    className="bg-[#2D5A4F] py-3 px-6 rounded-lg"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-kollektif text-base font-semibold text-center">
                      Lanjutkan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : currentPage === 4 ? (
              // Page 4: Mood Check
              <View className="flex-1">
                <Text className="text-[#2D5A4F] font-kollektif text-lg text-center mb-8">
                  Kabar Hari Ini
                </Text>

                {/* Mood Scale */}
                <View className="mb-8">
                  <View className="flex-row justify-center mb-4">
                    {moodEmojis.map((emoji, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSymptomData(prev => ({ ...prev, mood: index }))}
                        className={`w-12 h-12 rounded-full items-center justify-center mx-2 ${
                          symptomData.mood === index ? 'border-2 border-[#2D5A4F]' : ''
                        }`}
                        style={{ backgroundColor: moodColors[index] }}
                        activeOpacity={0.7}
                      >
                        <Text className="text-2xl">{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {/* Mood Scale Bar */}
                  <View className="flex-row items-center justify-between px-4 mb-2">
                    <Text className="text-red-500 font-bold">-</Text>
                    <View className="flex-1 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full mx-4 relative">
                      <View 
                        className="absolute w-1 h-4 bg-black rounded-full -top-1"
                        style={{ left: `${(symptomData.mood / 4) * 100}%` }}
                      />
                    </View>
                    <Text className="text-green-500 font-bold">+</Text>
                  </View>
                </View>

                {/* Mental Health Symptoms */}
                <View className="mb-8">
                  <Text className="text-[#2D5A4F] font-kollektif text-lg text-center mb-6">
                    Apakah kamu merasakan hal-hal ini?
                  </Text>

                  <View>
                    {mentalHealthOptions.map((symptom, index) => (
                      <View key={index} className="flex-row items-center mb-3">
                        <TouchableOpacity
                          onPress={() => handleMentalHealthToggle(symptom)}
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                            symptomData.mentalHealthSymptoms.includes(symptom)
                              ? 'bg-green-500 border-green-500'
                              : 'bg-white border-[#2D5A4F]'
                          }`}
                          activeOpacity={0.7}
                        >
                          {symptomData.mentalHealthSymptoms.includes(symptom) && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </TouchableOpacity>
                        <Text className="text-[#2D5A4F] font-kollektif text-base flex-1">
                          {symptom}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="mt-8">
                  <TouchableOpacity
                    onPress={handleBack}
                    className="bg-gray-300 py-3 px-6 rounded-lg mb-3"
                    activeOpacity={0.8}
                  >
                    <Text className="text-gray-700 font-kollektif text-base font-semibold text-center">
                      Kembali
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`py-3 px-6 rounded-lg ${loading ? 'bg-gray-400' : 'bg-[#2D5A4F]'}`}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-kollektif text-base font-semibold text-center ml-2">
                          Menyimpan...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-white font-kollektif text-base font-semibold text-center">
                        {existingData ? 'Update Data' : 'Simpan'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Page 5: Conclusion/Recommendations
              <View className="flex-1">
                <Text className="text-[#2D5A4F] font-kollektif text-xl font-bold text-center mb-6">
                  Rekomendasi untuk {existingData?.user_id ? 'Anda' : 'Anda'}
                </Text>

                {/* Points Earned */}
                <View className="bg-green-50 rounded-lg p-4 mb-6">
                  <Text className="text-green-700 font-kollektif text-lg font-bold text-center">
                    +{existingData?.points_earned || 100} Poin!
                  </Text>
                  <Text className="text-green-600 font-kollektif text-sm text-center">
                    Terima kasih telah menginput data hari ini
                  </Text>
                </View>

                {/* First Recommendation */}
                <View className="mb-6">
                  <Text className="text-[#2D5A4F] font-kollektif text-base mb-4">
                    Melakukan latihan pernafasan untuk mengurangi sesak nafas
                  </Text>
                  
                  {/* Video Placeholder */}
                  <View className="w-full h-48 bg-black rounded-lg mb-4 items-center justify-center">
                    <View className="items-center">
                      <Ionicons name="play-circle" size={48} color="white" />
                      <Text className="text-white font-kollektif text-sm mt-2">
                        3 Breaths
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Second Recommendation */}
                <View className="mb-6">
                  <Text className="text-[#2D5A4F] font-kollektif text-base mb-4">
                    Mengonsumsi makanan dengan nilai gizi yang cukup dan tentunya kamu sukai
                  </Text>
                  
                  {/* Food Illustrations */}
                  <View className="flex-row justify-between">
                    <View className="items-center">
                      <View className="w-16 h-16 bg-white rounded-lg border border-gray-300 items-center justify-center mb-2">
                        <Ionicons name="restaurant" size={24} color="#2D5A4F" />
                      </View>
                      <Text className="text-[#2D5A4F] font-kollektif text-xs text-center">
                        Sup Sayuran
                      </Text>
                    </View>
                    
                    <View className="items-center">
                      <View className="w-16 h-16 bg-white rounded-lg border border-gray-300 items-center justify-center mb-2">
                        <Ionicons name="fish" size={24} color="#2D5A4F" />
                      </View>
                      <Text className="text-[#2D5A4F] font-kollektif text-xs text-center">
                        Ikan & Sayur
                      </Text>
                    </View>
                    
                    <View className="items-center">
                      <View className="w-16 h-16 bg-white rounded-lg border border-gray-300 items-center justify-center mb-2">
                        <Ionicons name="leaf" size={24} color="#2D5A4F" />
                      </View>
                      <Text className="text-[#2D5A4F] font-kollektif text-xs text-center">
                        Salad Segar
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="mt-8">
                  <TouchableOpacity
                    onPress={handleGoToDashboard}
                    className="bg-[#2D5A4F] py-3 px-6 rounded-lg mb-3"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-kollektif text-base font-semibold text-center">
                      Kembali ke Dashboard
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="text-[#2D5A4F] font-kollektif text-sm">
              SMARTB
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
