import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
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
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, setMediaPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Request media library permissions
  React.useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        setPhotoTaken(true);
        
        // Show success feedback
        Alert.alert(
          'Foto Berhasil Diambil',
          'Foto verifikasi telah tersimpan. Verifikasi berhasil!',
          [
            {
              text: 'OK',
              onPress: () => {
                onVerificationSuccess();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Error',
        'Gagal mengambil foto. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
      onVerificationFailed();
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  // Loading state
  if (!permission) {
    return (
      <View className="w-full h-80 rounded-lg border-2 border-black overflow-hidden bg-gray-200 items-center justify-center">
        <Ionicons name="camera" size={48} color="#666" />
        <Text className="text-gray-600 font-kollektif text-sm mt-2">
          Meminta izin kamera...
        </Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View className="w-full h-80 rounded-lg border-2 border-red-300 overflow-hidden bg-red-50 items-center justify-center p-4">
        <Ionicons name="camera-outline" size={48} color="#ef4444" />
        <Text className="text-red-600 font-kollektif text-sm mt-2 text-center">
          Izin kamera diperlukan untuk verifikasi
        </Text>
        <TouchableOpacity 
          onPress={requestPermission}
          className="mt-4 bg-red-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-kollektif text-sm">
            Berikan Izin
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="w-full h-80 rounded-lg border-2 border-black overflow-hidden bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        flash={flash}
      >
        <View className="flex-1 bg-transparent">
          {/* Camera Controls - Top */}
          <View className="absolute top-4 left-4 right-4 flex-row justify-between">
            <TouchableOpacity
              onPress={toggleFlash}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Ionicons 
                name={flash === 'on' ? "flash" : "flash-off"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Ionicons name="camera-reverse" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Verification Guide */}
          <View className="absolute inset-0 items-center justify-center pointer-events-none">
            <View className="w-48 h-48 border-2 border-white/70 rounded-full items-center justify-center">
              <Text className="text-white font-kollektif text-sm bg-black/50 px-3 py-1 rounded">
                Posisikan wajah di dalam lingkaran
              </Text>
            </View>
          </View>

          {/* Capture Button */}
          <View className="absolute bottom-8 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={handleCapture}
              disabled={isCapturing}
              className={`w-16 h-16 rounded-full border-4 border-white items-center justify-center ${
                isCapturing ? 'bg-green-500' : 'bg-transparent'
              }`}
            >
              {isCapturing ? (
                <Ionicons name="checkmark" size={32} color="white" />
              ) : (
                <View className="w-12 h-12 bg-white rounded-full" />
              )}
            </TouchableOpacity>
            
            <Text className="text-white font-kollektif text-xs mt-2 bg-black/50 px-2 py-1 rounded">
              {isCapturing ? 'Mengambil foto...' : 'Tekan untuk foto'}
            </Text>
          </View>

          {/* Success Overlay */}
          {photoTaken && (
            <View className="absolute inset-0 bg-green-500/20 items-center justify-center">
              <View className="bg-green-500 rounded-full p-4">
                <Ionicons name="checkmark" size={48} color="white" />
              </View>
              <Text className="text-white font-kollektif text-lg mt-4 bg-black/50 px-4 py-2 rounded">
                Verifikasi Berhasil!
              </Text>
            </View>
          )}
        </View>
      </CameraView>
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
              Posisikan wajah Anda di dalam lingkaran dan tekan tombol untuk mengambil foto verifikasi. Pastikan pencahayaan cukup dan wajah terlihat jelas.
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