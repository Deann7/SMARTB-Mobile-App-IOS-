import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { WebView } from 'react-native-webview';
import { UserDashboard, supabase } from "../lib/supabase";
import { AuthService } from "../services/authService";
import { DailyInputService } from "../services/dailyInputService";
import { ReminderService } from "../services/reminderService";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserDashboard | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayInputStatus, setTodayInputStatus] = useState({
    hasInput: false,
    isComplete: false,
    pointsEarned: 0,
  });
  const [daysSinceRegistration, setDaysSinceRegistration] = useState<number>(0);
  const [nextSputumDate, setNextSputumDate] = useState<string | null>(null);
  const [daysUntilSputum, setDaysUntilSputum] = useState<number | null>(null);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [chatbotLoading, setChatbotLoading] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh dashboard when screen is focused (e.g., returning from input screen)
  useFocusEffect(
    useCallback(() => {
      console.log("Dashboard screen focused, refreshing data...");
      loadDashboardData();
    }, [])
  );

  // Keyboard visibility listener
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Function to calculate days since registration
  const calculateDaysSinceRegistration = (createdAt: string): number => {
    const registrationDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - registrationDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysDifference + 1; // +1 because first day should be day 1, not day 0
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get current user
        const user = await AuthService.getCurrentUser();
        if (!user) {
          console.log("No user found, redirecting to login");
          router.replace("/(auth)/login" as any);
          return;
        }

      console.log("Loading dashboard for user:", user.id);

      // Store current user data
      setCurrentUser(user);

      // Calculate days since registration
      if (user.created_at) {
        const daysSince = calculateDaysSinceRegistration(user.created_at);
        setDaysSinceRegistration(daysSince);
        console.log("Days since registration:", daysSince);
      }

      // Get treatment progress information
      const treatmentProgress = await DailyInputService.getTreatmentProgress();
      const currentDay = treatmentProgress.currentDay;
      const treatmentPhase = treatmentProgress.treatmentPhase;

      // Get user dashboard data using direct table access (more reliable)
      try {
        console.log(
          "Trying to get user dashboard from user_dashboard table..."
        );

        // Try to get from user_dashboard table first
        const { data: dashboardData, error: dashboardError } = await supabase
          .from("user_dashboard")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (dashboardError) {
          console.log(
            "user_dashboard table access failed:",
            dashboardError.message
          );
          console.log("User dashboard not found, creating...");

          // Try to create dashboard entry
          try {
            const { data: newDashboard, error: createError } = await supabase
              .from("user_dashboard")
              .insert({
                user_id: user.id,
                total_points: 0,
                current_streak: 0,
                longest_streak: 0,
              })
              .select()
              .single();

            if (createError) {
              console.log(
                "Failed to create dashboard, using default:",
                createError.message
              );
              throw createError;
            } else {
              console.log("Dashboard created successfully:", newDashboard);
              const formattedDashboard: UserDashboard = {
                user_id: newDashboard.user_id,
                full_name: user.full_name || "User",
                current_day: currentDay,
                total_points: newDashboard.total_points || 0,
                streak_days: newDashboard.current_streak || 0,
                total_inputs: 0,
                complete_inputs: 0,
                medication_days: 0,
                treatment_phase: treatmentPhase,
                last_data_input_date: undefined,
              };
              setUserData(formattedDashboard);
            }
          } catch (createError) {
            console.log("Create dashboard failed, using AuthService fallback");
            const fallbackData = await AuthService.getUserDashboard(user.id);
            // Update fallback data with calculated current day
            fallbackData.current_day = currentDay;
            fallbackData.treatment_phase = treatmentPhase;
            setUserData(fallbackData);
          }
        } else {
          console.log(
            "Dashboard data loaded from user_dashboard table:",
            dashboardData
          );
          const formattedDashboard: UserDashboard = {
            user_id: dashboardData.user_id,
            full_name: user.full_name || "User",
            current_day: currentDay, // Calculated from treatment_start_date
            total_points: dashboardData.total_points || 0,
            streak_days: dashboardData.current_streak || 0,
            total_inputs: 0,
            complete_inputs: 0,
            medication_days: 0,
            treatment_phase: treatmentPhase,
            last_data_input_date: undefined,
          };
          setUserData(formattedDashboard);
        }
      } catch (dashboardError) {
        console.error("Get user dashboard error:", dashboardError);
        console.log("All dashboard methods failed, using default values");
        // Create default dashboard data if everything fails
        const defaultDashboard: UserDashboard = {
          user_id: user.id,
          full_name: user.full_name || "User",
          current_day: currentDay,
          total_points: 0,
          streak_days: 0,
          total_inputs: 0,
          complete_inputs: 0,
          medication_days: 0,
          treatment_phase: treatmentPhase,
          last_data_input_date: undefined,
        };
        setUserData(defaultDashboard);
      }

      // Get today's input status
      try {
        const todayStatus = await DailyInputService.getTodayInputStatus();
        setTodayInputStatus(todayStatus);
      } catch (inputError) {
        console.error("Get today input status error:", inputError);
        // Set default status
        setTodayInputStatus({
          hasInput: false,
          isComplete: false,
          pointsEarned: 0,
        });
      }

      // Calculate sputum checkup countdown from account creation date
      try {
        if (user.created_at) {
          const accountCreationDate = new Date(user.created_at);
          // Calculate 6 months from account creation
          const sixMonthDate = new Date(accountCreationDate);
          sixMonthDate.setMonth(sixMonthDate.getMonth() + 6);

          setNextSputumDate(sixMonthDate.toISOString().split('T')[0]);

          // Calculate days until 6-month checkup
          const today = new Date();
          const timeDiff = sixMonthDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          setDaysUntilSputum(daysDiff);
        } else {
          setNextSputumDate(null);
          setDaysUntilSputum(null);
        }
      } catch (sputumError) {
        console.error("Calculate sputum countdown error:", sputumError);
        setNextSputumDate(null);
        setDaysUntilSputum(null);
      }
    } catch (error) {
      console.error("Load dashboard data error:", error);
      Alert.alert("Error", "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleInputDataToday = () => {
    if (todayInputStatus.hasInput) {
      Alert.alert(
        "Data Sudah Diinput",
        "Anda sudah menginput data hari ini. Apakah ingin mengubah data?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Ubah",
            onPress: () => router.push("/(protected)/input-data" as any),
          },
        ]
      );
    } else {
      router.push("/(protected)/camera-verification" as any);
    }
  };

  const handleMenuLainnya = () => {
    router.push("/(protected)/menu" as any);
  };

  const handleCalendar = () => {
    router.push("/(protected)/calendar" as any);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const openChatbot = () => {
    setChatbotVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const closeChatbot = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setChatbotVisible(false);
      setChatbotLoading(true);
    });
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>SMARTB AI Assistant</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: #ffffff;
        }
        body {
          display: flex;
          flex-direction: column;
        }
        #jotform-container {
          flex: 1;
          width: 100%;
          height: 100%;
          position: relative;
        }
        iframe {
          border: none;
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="jotform-container">
        <iframe 
          id="JotFormIFrame-agent" 
          src="https://www.jotform.com/ai-agent/019a39cd4ebf787eb91665b20832550a3ab6"
          frameborder="0"
          scrolling="yes"
          allow="geolocation; microphone; camera"
          style="width: 100%; height: 100%; border: none;"
        >
        </iframe>
      </div>
      <script>
        window.addEventListener('load', function() {
          setTimeout(function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
            }
          }, 2000);
        });
      </script>
    </body>
    </html>
  `;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="text-gray-600 mt-4 font-kollektif">
            Memuat data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      <SafeAreaView className="flex-1 bg-[#f1f8f5]">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
        >
          {/* Header with background */}
          <View className="px-3 pt-8 relative">
            {/* Header Content */}
            <View className="flex-row items-center justify-between mt-8 px-2">
              <View className="bg-smar-green p-4 max-w-full rounded-3xl flex-1">
                <Text className="text-white font-kollektif text-md font-bold text-center">
                  Selamat datang kembali
                </Text>
                <Text className="text-white font-kollektif text-3xl font-bold text-center">
                  {currentUser?.nickname || currentUser?.full_name || "User"}
                </Text>
              </View>
              <Image
                source={require("../../assets/images/png/icon.png")}
                className="w-32 h-32"
              />
            </View>
          </View>

          {/* Treatment Progress Card */}
          <View className="p-1 mx-4">
            <View className="items-center">
              {/* Clean Two Column Layout */}
              <View className="flex-row justify-between w-full mb-2">
                {/* Left Column - Sputum Checkup */}
                <View className="flex-1 mr-2">
                  <View className="bg-white rounded-xl p-2 shadow-sm">
                    <View className="items-center">
                      <View className={`w-16 h-16 rounded-full items-center justify-center mb-2 ${
                        daysUntilSputum !== null && daysUntilSputum <= 0 ? 'bg-red-100' :
                        daysUntilSputum !== null && daysUntilSputum <= 30 ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <Ionicons
                          name="flask"
                          size={24}
                          color={
                            daysUntilSputum !== null && daysUntilSputum <= 0 ? '#dc2626' :
                            daysUntilSputum !== null && daysUntilSputum <= 30 ? '#d97706' :
                            '#2563eb'
                          }
                        />
                      </View>
                      <Text className="text-gray-800 font-kollektif text-sm font-extrabold mb-1">
                        Sputum Checkup
                      </Text>
                      <Text className={`font-kollektif text-lg font-bold mb-1 ${
                        daysUntilSputum !== null && daysUntilSputum <= 0 ? 'text-red-600' :
                        daysUntilSputum !== null && daysUntilSputum <= 30 ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {daysUntilSputum !== null ? Math.abs(daysUntilSputum) : '--'}
                      </Text>
                      <Text className={`font-kollektif text-xs text-center ${
                        daysUntilSputum !== null && daysUntilSputum <= 0 ? 'text-red-500' :
                        daysUntilSputum !== null && daysUntilSputum <= 30 ? 'text-yellow-500' :
                        'text-blue-500'
                      }`}>
                        {daysUntilSputum !== null && daysUntilSputum > 0
                          ? 'hari lagi'
                          : daysUntilSputum !== null && daysUntilSputum === 0
                            ? 'hari ini'
                            : daysUntilSputum !== null
                              ? 'hari terlewat'
                              : 'menghitung...'
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right Column - Treatment Progress */}
                <View className="flex-1 ml-2">
                  <View className="bg-white rounded-xl p-2 shadow-sm">
                    <View className="items-center">
                      <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-2">
                        <Ionicons name="medical" size={24} color="#16a34a" />
                      </View>
                      <Text className="text-gray-800 font-kollektif text-sm font-extrabold mb-1">
                        Hari Pengobatan
                      </Text>
                      <Text className="text-smar-green font-kollektif text-lg font-bold mb-1">
                        {daysSinceRegistration}
                      </Text>
                      <Text className="text-gray-600 font-kollektif text-xs text-center">
                        Fase {userData?.treatment_phase || "Intensif"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Points Display */}
              <View className="bg-green-50 rounded-lg p-2 mb-2 w-full">
                <Text className="text-smar-green font-kollektif text-lg font-bold text-center">
                  {userData?.total_points || 0} Poin
                </Text>
                <Text className="text-gray-600 font-kollektif text-sm text-center">
                  Streak: {userData?.streak_days || 0} hari
                </Text>
              </View>

              <Image
                source={require("../../assets/images/png/tree-main.png")}
                className="w-72 h-56"
              />

              <Text className="text-gray-600 font-kollektif text-sm text-center mb-6">
                Semangat menumbuhkan pohon paru-paru!
              </Text>

              {/* Input Data Button */}
              <TouchableOpacity
                onPress={handleInputDataToday}
                className={`rounded-full px-8 py-4 mb-2 shadow-sm ${
                  todayInputStatus.hasInput
                    ? "bg-blue-500 border-2 border-blue-600"
                    : "bg-white border-2 border-gray-300"
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={`font-kollektif text-base font-medium ${
                    todayInputStatus.hasInput ? "text-white" : "text-gray-700"
                  }`}
                >
                  {todayInputStatus.hasInput
                    ? "Ubah Data Hari Ini"
                    : "Input Data Hari Ini"}
                </Text>
              </TouchableOpacity>

              {/* Menu Lainnya Button */}
              <TouchableOpacity
                onPress={handleMenuLainnya}
                className="bg-white border-2 border-gray-300 rounded-full px-8 py-4 shadow-sm"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 font-kollektif text-base font-medium">
                  Menu Lainnya
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
        </ScrollView>
        
        {/* Floating Chatbot Button - Above Calendar */}
        <TouchableOpacity
          onPress={openChatbot}
          className="absolute bottom-24 right-6 rounded-full p-2 shadow-lg"
          activeOpacity={0.8}
          style={{
            backgroundColor: '#3E0E46',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Image
            source={require('../../assets/images/png/chatbot.png')}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Floating Calendar Button */}
        <TouchableOpacity
          onPress={handleCalendar}
          className="absolute bottom-6 right-6 bg-smar-green rounded-full p-4 shadow-lg"
          activeOpacity={0.8}
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons name="calendar" size={24} color="white" />
        </TouchableOpacity>

        {/* Chatbot Modal Pop-up */}
        <Modal
          visible={chatbotVisible}
          transparent={true}
          animationType="none"
          onRequestClose={closeChatbot}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              activeOpacity={1} 
              onPress={closeChatbot}
            />
            <Animated.View
              style={{
                height: SCREEN_HEIGHT * 0.85,
                backgroundColor: '#fff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                transform: [{ translateY: slideAnim }],
                overflow: 'hidden',
              }}
            >
              {/* Header Hijau - Layer 1 (di atas) */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#2D5A4F',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  zIndex: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../assets/images/png/chatbot.png')}
                    style={{ width: 32, height: 32, marginRight: 8, borderRadius: 16 }}
                    resizeMode="cover"
                  />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                    Dr. Budi
                  </Text>
                </View>
                <TouchableOpacity onPress={closeChatbot} style={{ padding: 4 }}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* WebView Content - Layer 2 (di-crop bagian atas untuk sembunyikan header ungu JotForm) */}
              <View style={{ flex: 1, position: 'relative', overflow: 'hidden', marginTop: -180, paddingTop: 0, marginBottom: -10, paddingBottom: keyboardVisible ? 250 : 0 }}>
                <WebView
                  source={{ 
                    uri: 'https://www.jotform.com/ai-agent/019a39cd4ebf787eb91665b20832550a3ab6'
                  }}
                  style={{ flex: 1, backgroundColor: '#ffffff' }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  scalesPageToFit={true}
                  showsVerticalScrollIndicator={true}
                  showsHorizontalScrollIndicator={false}
                  injectedJavaScript={`
                    (function() {
                      function removeFooter() {
                        // Hapus footer "By chatting, you agree to AI Terms" dan logo JotForm
                        const elements = document.querySelectorAll('footer, [class*="footer"], [class*="Footer"], [id*="footer"], [id*="Footer"]');
                        elements.forEach(el => {
                          if (el.textContent.includes('chatting') || 
                              el.textContent.includes('AI Terms') || 
                              el.textContent.includes('Jotform')) {
                            el.style.display = 'none';
                            el.remove();
                          }
                        });
                        
                        // Hapus semua link yang mengarah ke Jotform
                        const links = document.querySelectorAll('a[href*="jotform"]');
                        links.forEach(link => {
                          const parent = link.closest('div, footer, section');
                          if (parent) {
                            parent.style.display = 'none';
                            parent.remove();
                          }
                        });
                      }
                      
                      // Jalankan saat halaman load
                      if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', removeFooter);
                      } else {
                        removeFooter();
                      }
                      
                      // Jalankan berulang untuk menangkap elemen yang dimuat dinamis
                      setTimeout(removeFooter, 500);
                      setTimeout(removeFooter, 1000);
                      setTimeout(removeFooter, 2000);
                      setTimeout(removeFooter, 3000);
                    })();
                    true;
                  `}
                  onLoadStart={() => {
                    console.log('WebView loading started');
                    setChatbotLoading(true);
                  }}
                  onLoadEnd={() => {
                    console.log('WebView loading ended');
                    setTimeout(() => setChatbotLoading(false), 2000);
                  }}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView error:', nativeEvent);
                    setChatbotLoading(false);
                  }}
                  thirdPartyCookiesEnabled={true}
                  mixedContentMode="always"
                  allowFileAccess={true}
                  allowUniversalAccessFromFileURLs={true}
                  originWhitelist={['*']}
                  javaScriptCanOpenWindowsAutomatically={true}
                  setSupportMultipleWindows={false}
                  mediaPlaybackRequiresUserAction={false}
                  allowsInlineMediaPlayback={true}
                />
                
                {chatbotLoading && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 80,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#f5f5f5',
                    }}
                  >
                    <ActivityIndicator size="large" color="#2D5A4F" />
                    <Text style={{ marginTop: 16, fontSize: 16, color: '#2D5A4F' }}>
                      Memuat AI Assistant...
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};
