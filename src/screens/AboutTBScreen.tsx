import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isExpanded: boolean;
}

const FAQItem: React.FC<{
  item: FAQItem;
  onToggle: (id: string) => void;
}> = ({ item, onToggle }) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: item.isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: item.isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [item.isExpanded]);

  return (
    <View className="border-b border-gray-200">
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        className="flex-row justify-between items-center py-4 px-4"
        activeOpacity={0.7}
      >
        <Text className="text-gray-800 font-kollektif text-base flex-1">
          {item.question}
        </Text>
        <Animated.View
          style={{
            transform: [{
              rotate: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              }),
            }],
          }}
        >
          <Ionicons
            name="chevron-down"
            size={20}
            color="#2D5A4F"
          />
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View
        style={{
          maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
          opacity: animatedOpacity,
          overflow: 'hidden',
        }}
      >
        <View className="px-4 pb-4">
          <Text className="text-gray-600 font-kollektif text-sm leading-6">
            {item.answer}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const SearchBar: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ searchQuery, onSearchChange }) => {
  return (
    <View className="bg-gray-100 rounded-xl mx-4 my-4 px-4 py-3 flex-row items-center">
      <Ionicons name="search" size={20} color="#666" />
      <TextInput
        className="flex-1 ml-3 font-kollektif text-base"
        placeholder="Pertanyaan yang sering diajukan"
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor="#999"
      />
    </View>
  );
};

export const AboutTBScreen: React.FC = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'Apa itu TB?',
      answer: 'Tuberkulosis (TB) adalah penyakit mematikan yang terutama menyerang paru-paru. Satu kelompok bakteri bertanggung jawab atas tuberkulosis. Saat seseorang yang menderita tuberkulosis batuk, bersin, atau bernyanyi, penyakit tersebut dapat menyebar. Hal ini dapat melepaskan sejumlah kecil kuman ke udara. Bakteri tersebut kemudian dapat masuk ke paru-paru orang lain yang menghirup droplet tersebut.',
      isExpanded: false
    },
    {
      id: '2',
      question: 'Apakah TB dapat disembuhkan?',
      answer: 'Ya, TB dapat disembuhkan dengan pengobatan yang tepat dan konsisten. Pengobatan TB biasanya memerlukan waktu 6-9 bulan dengan kombinasi beberapa jenis antibiotik. Penting untuk mengonsumsi obat secara teratur dan menyelesaikan seluruh rangkaian pengobatan untuk mencegah resistensi bakteri dan kekambuhan penyakit.',
      isExpanded: false
    },
    {
      id: '3',
      question: 'Apa saja gejala dari TB?',
      answer: 'Gejala TB meliputi batuk yang berlangsung lebih dari 2 minggu, batuk berdahak atau berdarah, demam, berkeringat di malam hari, penurunan berat badan, kehilangan nafsu makan, kelelahan, dan sesak napas. Gejala dapat berkembang secara bertahap dan mungkin ringan pada awalnya, sehingga sering diabaikan.',
      isExpanded: false
    },
    {
      id: '4',
      question: 'Bagaimana jika saya memiliki gejala TB?',
      answer: 'Jika Anda mengalami gejala TB, segera konsultasikan dengan dokter atau fasilitas kesehatan terdekat. Dokter akan melakukan pemeriksaan fisik, tes dahak, dan rontgen dada untuk mendiagnosis TB. Semakin cepat TB terdeteksi dan diobati, semakin baik hasil pengobatannya. Jangan ragu untuk mencari bantuan medis.',
      isExpanded: false
    },
    {
      id: '5',
      question: 'Dimana saya dapat periksa TB?',
      answer: 'Anda dapat memeriksa TB di berbagai fasilitas kesehatan seperti Puskesmas, rumah sakit, klinik TB, atau laboratorium yang menyediakan layanan pemeriksaan TB. Pemeriksaan TB biasanya gratis di fasilitas kesehatan pemerintah. Hubungi fasilitas kesehatan terdekat untuk informasi lebih lanjut tentang layanan pemeriksaan TB yang tersedia.',
      isExpanded: false
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const toggleFAQ = (id: string) => {
    setFaqItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isExpanded: !item.isExpanded }
          : item
      )
    );
  };
  
  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackPress = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2D5A4F" />
      <SafeAreaView className="flex-1 bg-smar-light">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="bg-smar-green px-6 pt-8 pb-16 relative">
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBackPress}
              className="absolute top-12 left-6 z-10"
              activeOpacity={0.8}
            >
              <View className="bg-white/20 rounded-full p-2">
                <Text className="text-white font-kollektif text-lg">←</Text>
              </View>
            </TouchableOpacity>

            {/* Header Content */}
            <View className="flex-row items-center justify-between mt-12">
              <View className="bg-smar-green rounded-lg p-4">
                <Text className="text-white font-kollektif text-xl font-bold">
                  Tentang TB
                </Text>
              </View>
              
              {/* 3D Icon - Book with magnifying glass */}
              <View className="items-center">
                <View className="w-16 h-16 bg-purple-200 rounded-lg items-center justify-center relative">
                  {/* Book */}
                  <View className="w-12 h-8 bg-purple-300 rounded-sm" />
                  {/* Magnifying glass */}
                  <View className="absolute -top-1 -right-1 w-6 h-6 bg-blue-300 rounded-full items-center justify-center">
                    <View className="w-3 h-3 bg-blue-400 rounded-full" />
                  </View>
                  {/* Sparkles */}
                  <View className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-300 rounded-full" />
                  <View className="absolute -bottom-1 -right-2 w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                </View>
              </View>
            </View>
          </View>

          {/* Search Section */}
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* FAQ List Section */}
          <View className="flex-1 px-4 pb-8">
            <View className="bg-white rounded-lg overflow-hidden">
              {filteredFAQ.map((item) => (
                <FAQItem
                  key={item.id}
                  item={item}
                  onToggle={toggleFAQ}
                />
              ))}
            </View>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="text-smar-green font-kollektif text-sm">
              SMARTB
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}; 