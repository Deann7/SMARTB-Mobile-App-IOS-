import { Ionicons } from '@expo/vector-icons';
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

interface CameraVerificationProps {
  onVerificationSuccess: () => void;
  onVerificationFailed: () => void;
}

const CameraVerification: React.FC<CameraVerificationProps> = ({
  onVerificationSuccess,
  onVerificationFailed
}) => {
  const [faceDetected, setFaceDetected] = useState(false);

  // Mock face detection - simulate detection after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setFaceDetected(true);
      // Auto-verify after 2 seconds of face detection
      setTimeout(() => {
        onVerificationSuccess();
      }, 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onVerificationSuccess]);

  const handleCapture = async () => {
    try {
      console.log('Photo captured (mock)');
      onVerificationSuccess();
    } catch (error) {
      console.error('Error capturing photo:', error);
      onVerificationFailed();
    }
  };

  return (
    <View className="w-full h-80 rounded-lg border-2 border-black overflow-hidden bg-gray-200">
      {/* Mock Camera Preview */}
      <View className="w-full h-full bg-gray-300 items-center justify-center">
        <View className="items-center">
          <Ionicons name="camera" size={64} color="#666" />
          <Text className="text-gray-600 font-kollektif text-sm mt-2">
            Camera Preview
          </Text>
          <Text className="text-gray-500 font-kollektif text-xs mt-1">
            (Mock Implementation)
          </Text>
        </View>
        
        {/* Face Detection Overlay */}
        {faceDetected && (
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-48 h-48 border-2 border-green-500 rounded-full items-center justify-center">
              <Text className="text-green-500 font-kollektif text-sm">
                Wajah Terdeteksi
              </Text>
            </View>
          </View>
        )}
        
        {/* Capture Button */}
        <TouchableOpacity
          onPress={handleCapture}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black rounded-full items-center justify-center"
        >
          <View className="w-8 h-8 bg-white rounded-full" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const VerificationStatus: React.FC<{
  isVerified: boolean;
  onPress: () => void;
}> = ({ isVerified, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mx-4 py-3 px-6 rounded-lg ${
        isVerified 
          ? 'bg-green-500' 
          : 'bg-pink-300'
      }`}
      activeOpacity={0.8}
    >
      <Text className="text-white font-kollektif text-base font-semibold text-center">
        {isVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}
      </Text>
    </TouchableOpacity>
  );
};

export const CameraVerificationScreen: React.FC = () => {
  const [currentDay, setCurrentDay] = useState(30);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    // Navigate to input data after verification
    setTimeout(() => {
      router.push('/(protected)/input-data' as any);
    }, 1000);
  };

  const handleVerificationFailed = () => {
    setIsVerified(false);
    Alert.alert('Verifikasi Gagal', 'Pastikan wajah Anda terlihat jelas di kamera');
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2D5A4F" />
      <SafeAreaView className="flex-1 bg-[#F5F5F5]">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="bg-green-100 px-6 pt-8 pb-6 rounded-b-3xl">
            <View className="flex-row justify-between items-center">
              {/* Day Counter */}
              <View className="bg-[#2D5A4F] rounded-lg px-4 py-2">
                <Text className="text-white font-kollektif text-lg font-bold">
                  HARI {currentDay}
                </Text>
              </View>
              
              {/* Calendar Icon */}
              <View className="items-center">
                <Ionicons name="calendar" size={32} color="#666" />
                <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              </View>
            </View>
          </View>

          {/* Title */}
          <View className="px-6 py-4">
            <Text className="text-gray-800 font-kollektif text-xl font-bold text-center">
              Input Data{'\n'}Minum Obat
            </Text>
          </View>

          {/* Camera Section */}
          <View className="px-6 py-4">
            <CameraVerification
              onVerificationSuccess={handleVerificationSuccess}
              onVerificationFailed={handleVerificationFailed}
            />
          </View>

          {/* Instructions */}
          <View className="px-6 py-4">
            <Text className="text-gray-600 font-kollektif text-sm text-center leading-5">
              Pastikan wajah dan obat yang diminum terlihat kamera agar dapat terverifikasi oleh sistem
            </Text>
          </View>

          {/* Verification Status */}
          <View className="py-4">
            <VerificationStatus
              isVerified={isVerified}
              onPress={() => {
                if (!isVerified) {
                  Alert.alert('Verifikasi', 'Harap selesaikan verifikasi kamera terlebih dahulu');
                } else {
                  // Navigate to input data
                  router.push('/(protected)/input-data' as any);
                }
              }}
            />
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
