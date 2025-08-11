import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DailyInput } from '../lib/supabase';
import { DailyInputService } from '../services/dailyInputService';

interface CalendarDay {
  date: string;
  hasInput: boolean;
  isComplete: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyInputs, setDailyInputs] = useState<DailyInput[]>([]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // Get daily inputs for the past 3 months
      const history = await DailyInputService.getDailyInputHistory(90);
      setDailyInputs(history);
      
      // Generate calendar days for current month
      const days = generateCalendarDays(currentDate, history);
      setCalendarDays(days);
    } catch (error) {
      console.error('Load calendar data error:', error);
      Alert.alert('Error', 'Gagal memuat data kalender.');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (date: Date, inputs: DailyInput[]): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday
    
    // Get today's date for comparison
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const days: CalendarDay[] = [];
    
    // Add empty days for previous month
    for (let i = 0; i < startDay; i++) {
      const prevDate = new Date(year, month, -startDay + i + 1);
      const dateStr = prevDate.toISOString().split('T')[0];
      const input = inputs.find(inp => inp.input_date === dateStr);
      
      days.push({
        date: dateStr,
        hasInput: !!input,
        isComplete: input?.is_complete || false,
        isToday: dateStr === todayStr,
        isCurrentMonth: false,
      });
    }
    
    // Add days for current month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const dateStr = currentDay.toISOString().split('T')[0];
      const input = inputs.find(inp => inp.input_date === dateStr);
      
      days.push({
        date: dateStr,
        hasInput: !!input,
        isComplete: input?.is_complete || false,
        isToday: dateStr === todayStr,
        isCurrentMonth: true,
      });
    }
    
    // Add days for next month to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      const dateStr = nextDate.toISOString().split('T')[0];
      const input = inputs.find(inp => inp.input_date === dateStr);
      
      days.push({
        date: dateStr,
        hasInput: !!input,
        isComplete: input?.is_complete || false,
        isToday: dateStr === todayStr,
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDayPress = (day: CalendarDay) => {
    if (day.hasInput) {
      Alert.alert(
        'Data Tersedia',
        `Anda sudah melakukan input data pada tanggal ${formatDate(day.date)}.\n\nStatus: ${day.isComplete ? 'Lengkap ✅' : 'Tidak Lengkap ⚠️'}`,
        [
          { text: 'OK' },
          { 
            text: 'Lihat Detail', 
            onPress: () => {
              // Navigate to input detail or edit screen
              // For now, we'll show an alert
              Alert.alert('Info', 'Fitur detail akan segera tersedia.');
            }
          }
        ]
      );
    } else if (day.isCurrentMonth) {
      const today = new Date().toISOString().split('T')[0];
      if (day.date > today) {
        Alert.alert('Peringatan', 'Anda belum bisa mengisi data untuk tanggal yang akan datang.');
      } else {
        Alert.alert(
          'Tidak Ada Data',
          `Anda belum melakukan input data pada tanggal ${formatDate(day.date)}.`,
          [
            { text: 'OK' },
            { 
              text: 'Input Sekarang', 
              onPress: () => {
                router.push('/(protected)/input-data' as any);
              }
            }
          ]
        );
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getDayStyle = (day: CalendarDay) => {
    let baseStyle = 'w-10 h-10 rounded-full flex items-center justify-center m-1';
    
    if (!day.isCurrentMonth) {
      baseStyle += ' opacity-30';
    }
    
    if (day.isToday) {
      baseStyle += ' border-2 border-smar-green';
    }
    
    if (day.hasInput) {
      if (day.isComplete) {
        baseStyle += ' bg-green-500';
      } else {
        baseStyle += ' bg-yellow-500';
      }
    } else if (day.isCurrentMonth) {
      baseStyle += ' bg-gray-100';
    }
    
    return baseStyle;
  };

  const getTextStyle = (day: CalendarDay) => {
    let style = 'font-kollektif text-sm';
    
    if (day.hasInput) {
      style += ' text-white font-bold';
    } else if (day.isToday) {
      style += ' text-smar-green font-bold';
    } else if (day.isCurrentMonth) {
      style += ' text-gray-800';
    } else {
      style += ' text-gray-400';
    }
    
    return style;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600 font-kollektif">Memuat kalender...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />
      
      {/* Header */}
      <View className="bg-smar-green px-6 py-4 pt-12 ">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-kollektif text-lg font-bold">
            Kalender Input Data
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Month Navigation */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigateMonth('prev')}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={20} color="#2E7D32" />
          </TouchableOpacity>
          
          <Text className="text-xl font-kollektif font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity
            onPress={() => navigateMonth('next')}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="font-kollektif font-bold text-gray-800 mb-2">Keterangan:</Text>
          <View className="flex-row flex-wrap justify-between">
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-4 rounded-full bg-green-500 mr-2" />
              <Text className="font-kollektif text-sm text-gray-600">Data Lengkap</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-4 rounded-full bg-yellow-500 mr-2" />
              <Text className="font-kollektif text-sm text-gray-600">Data Tidak Lengkap</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-4 rounded-full bg-gray-100 border border-smar-green mr-2" />
              <Text className="font-kollektif text-sm text-gray-600">Hari Ini</Text>
            </View>
          </View>
        </View>

        {/* Day Names */}
        <View className="flex-row justify-between mb-2">
          {dayNames.map((dayName) => (
            <View key={dayName} className="w-10 h-8 flex items-center justify-center">
              <Text className="font-kollektif text-sm font-bold text-gray-600">
                {dayName}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <View key={weekIndex} className="flex-row justify-between mb-1">
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                <TouchableOpacity
                  key={`${day.date}-${weekIndex}-${dayIndex}`}
                  onPress={() => handleDayPress(day)}
                  className={getDayStyle(day)}
                  activeOpacity={0.7}
                >
                  <Text className={getTextStyle(day)}>
                    {new Date(day.date).getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View className="mt-8 bg-blue-50 rounded-lg p-4">
          <Text className="font-kollektif font-bold text-gray-800 mb-3">
            Statistik Bulan Ini
          </Text>
          
          {(() => {
            const currentMonthInputs = calendarDays.filter(
              day => day.isCurrentMonth && day.hasInput
            );
            const completeInputs = currentMonthInputs.filter(day => day.isComplete);
            const totalDaysInMonth = calendarDays.filter(day => day.isCurrentMonth).length;
            
            return (
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="font-kollektif text-gray-600">Total Hari Input:</Text>
                  <Text className="font-kollektif font-bold text-gray-800">
                    {currentMonthInputs.length} / {totalDaysInMonth}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-kollektif text-gray-600">Data Lengkap:</Text>
                  <Text className="font-kollektif font-bold text-green-600">
                    {completeInputs.length}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-kollektif text-gray-600">Tingkat Konsistensi:</Text>
                  <Text className="font-kollektif font-bold text-smar-green">
                    {totalDaysInMonth > 0 ? Math.round((currentMonthInputs.length / totalDaysInMonth) * 100) : 0}%
                  </Text>
                </View>
              </View>
            );
          })()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
