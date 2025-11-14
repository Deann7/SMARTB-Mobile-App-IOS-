import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { User } from '../lib/supabase';
import { AuthService } from '../services/authService';

interface CameraVerificationProps {
  onVerificationSuccess: () => void;
  onVerificationFailed: () => void;
}

const CameraVerification: React.FC<CameraVerificationProps> = ({
  onVerificationSuccess,
  onVerificationFailed
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleVerification = async () => {
    if (isVerifying) return;

    try {
      setIsVerifying(true);

      if (!cameraRef.current) throw new Error('Camera not ready');

      // Capture photo from camera with optimized settings
      console.log('Capturing photo...');
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.8,
        skipProcessing: false,
      });
      
      if (!photo || !photo.uri) {
        throw new Error('Failed to capture photo - no URI');
      }

      const uri = photo.uri;
      console.log('Photo captured successfully:', uri);

      // Prepare multipart/form-data with proper file handling
      const formData = new FormData();
      
      // Generate filename with timestamp to avoid caching
      const timestamp = Date.now();
      const fileName = `face_verification_${timestamp}.jpg`;
      
      // Append file with proper MIME type
      formData.append('image', {
        uri,
        name: fileName,
        type: 'image/jpeg',
      } as any);

      console.log('Uploading image to API...', fileName);

      // Upload with timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch('https://eat-medicine.vercel.app/pose', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      console.log('API Response Status:', res.status);

      if (!res.ok) {
        const responseText = await res.text().catch(() => '');
        console.error('Upload failed with status', res.status, ':', responseText);
        throw new Error(`API returned status ${res.status}: ${responseText || 'Unknown error'}`);
      }

      // Parse response
      const json = await res.json().catch((err) => {
        console.error('Failed to parse response JSON:', err);
        return {};
      });

      console.log('API Response:', json);

      // Check for acceptance - handle both 'accepted' and other possible response formats
      const accepted = json.accepted === true || json.success === true;

      if (accepted) {
        console.log('Verification successful');
        setVerificationComplete(true);
        Alert.alert('Verifikasi Berhasil', 'Verifikasi wajah berhasil dilakukan!', [
          { text: 'OK', onPress: () => onVerificationSuccess() },
        ]);
      } else {
        console.log('Verification rejected by API');
        // Rejected by server: prompt user to retake
        Alert.alert(
          'Verifikasi Ditolak', 
          'Pastikan anda mengikuti instruksi dengan benar!',
          [{ text: 'OK', onPress: () => onVerificationFailed() }]
        );
      }
    } catch (error: any) {
      console.error('Error during verification:', error);
      
      // Provide specific error messages
      let errorMessage = 'Gagal melakukan verifikasi. Silakan coba lagi.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Pastikan koneksi internet stabil.';
      } else if (error instanceof TypeError) {
        errorMessage = 'Koneksi gagal. Periksa internet Anda.';
      } else if (error.message) {
        console.error('Error details:', error.message);
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      onVerificationFailed();
    } finally {
      setIsVerifying(false);
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

          {/* Verification Button */}
          <View className="absolute bottom-8 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={handleVerification}
              disabled={isVerifying}
              className={`w-16 h-16 rounded-full border-4 border-white items-center justify-center ${
                isVerifying ? 'bg-blue-500' : 'bg-transparent'
              }`}
            >
              {isVerifying ? (
                <Ionicons name="eye" size={32} color="white" />
              ) : (
                <Ionicons name="scan" size={32} color="white" />
              )}
            </TouchableOpacity>
            
            <Text className="text-white font-kollektif text-xs mt-2 bg-black/50 px-2 py-1 rounded">
              {isVerifying ? 'Memverifikasi...' : 'Tekan untuk verifikasi'}
            </Text>
          </View>

          {/* Success Overlay */}
          {verificationComplete && (
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
  const [daysSinceRegistration, setDaysSinceRegistration] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  // Function to calculate days since registration
  const calculateDaysSinceRegistration = (createdAt: string): number => {
    const registrationDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - registrationDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysDifference + 1; // +1 because first day should be day 1, not day 0
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await AuthService.getCurrentUser();
      if (!user) {
        console.log('No user found, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      setCurrentUser(user);

      // Calculate days since registration
      if (user.created_at) {
        const daysSince = calculateDaysSinceRegistration(user.created_at);
        setDaysSinceRegistration(daysSince);
        console.log('Days since registration:', daysSince);
      }
      
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <SafeAreaView className="flex-1 bg-[#f1f8f5]">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <TouchableOpacity
        onPress={handleBackPress}
        className="top-10 left-6 z-10"
        activeOpacity={0.8}
      >
        <View className="">
          <Text className="text-black font-bold font-kollektif text-2xl">
            ←
          </Text>
        </View>
      </TouchableOpacity>

      <View className="px-6 pt-6 pb-4 relative">
        {/* Back Button */}

        {/* Header Content */}
        <View className="flex-row items-center justify-between mt-6 px-4">
          <View className="bg-smar-green p-4 max-w-48 rounded-3xl mr-10 flex-1">
            <Text className="text-white font-kollektif text-4xl font-bold text-center">
            Hari {loading ? '...' : daysSinceRegistration}
            </Text>
          </View>
          <View className="items-center">
                <Ionicons name="calendar" size={64} color="#666" />
                <View className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              </View>
        </View>
      </View>

          {/* Title */}
          <View className="px-6 py-2">
            <Text className="text-gray-800 font-kollektif text-2xl font-bold text-center">
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
              Posisikan wajah Anda di dalam lingkaran dan tekan tombol untuk melakukan verifikasi. Pastikan pencahayaan cukup dan wajah terlihat jelas.
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