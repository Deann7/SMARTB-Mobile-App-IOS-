import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface HealthFacility {
  id: string;
  name: string;
  distance: number;
  address: string;
  type: "Puskesmas" | "Rumah Sakit" | "Klinik";
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  status: "Online" | "Offline";
  rating: number;
  experience: number;
  availableForChat: boolean;
  availableForCall: boolean;
  avatar?: string;
}

const useSearchFacilities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [facilities, setFacilities] = useState<HealthFacility[]>([
    {
      id: "1",
      name: "Puskesmas Kecamatan A Jakarta Timur",
      distance: 3.0,
      address: "Jl. Contoh No. 123, Jakarta Timur",
      type: "Puskesmas",
      coordinates: { latitude: -6.2088, longitude: 106.8456 },
    },
    {
      id: "2",
      name: "Puskesmas Kecamatan B Jakarta Timur",
      distance: 6.0,
      address: "Jl. Contoh No. 456, Jakarta Timur",
      type: "Puskesmas",
      coordinates: { latitude: -6.2088, longitude: 106.8456 },
    },
    {
      id: "3",
      name: "Puskesmas Kota C Jakarta Selatan",
      distance: 7.4,
      address: "Jl. Contoh No. 789, Jakarta Selatan",
      type: "Puskesmas",
      coordinates: { latitude: -6.2088, longitude: 106.8456 },
    },
  ]);

  const filteredFacilities = facilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return { searchQuery, setSearchQuery, filteredFacilities };
};

const useSearchDoctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: "1",
      name: "Anissa",
      specialization: "Pulmonologi",
      status: "Online",
      rating: 4.8,
      experience: 5,
      availableForChat: true,
      availableForCall: true,
    },
    {
      id: "2",
      name: "Bambang",
      specialization: "Pulmonologi",
      status: "Online",
      rating: 4.6,
      experience: 8,
      availableForChat: true,
      availableForCall: true,
    },
  ]);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return { searchQuery, setSearchQuery, filteredDoctors };
};

const SearchBar: React.FC<{
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}> = ({ placeholder, value, onChangeText }) => {
  return (
    <View className="bg-[#97aba3] rounded-fulll mx-8 rounded-full px-4 py-3 flex-row items-center">
      <Ionicons name="search" size={20} color="#666" />
      <TextInput
        className="flex-1 ml-3 font-kollektif text-base rounded-full"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#1c4735"
      />
    </View>
  );
};

const FacilityItem: React.FC<{
  facility: HealthFacility;
  onPress: () => void;
}> = ({ facility, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-3 px-4 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-1">
        <Text className="text-gray-800 font-kollektif text-base font-medium">
          {facility.name} - {facility.distance} km
        </Text>
      </View>
      <Ionicons name="location" size={24} color="#EF4444" />
    </TouchableOpacity>
  );
};

const DoctorItem: React.FC<{
  doctor: Doctor;
  onChatPress: () => void;
  onCallPress: () => void;
}> = ({ doctor, onChatPress, onCallPress }) => {
  return (
    <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-gray-800 font-kollektif text-base font-medium">
            dr. {doctor.name}
          </Text>
          <View className="ml-2 bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-green-600 font-kollektif text-xs">
              {doctor.status}
            </Text>
          </View>
        </View>
        <Text className="text-gray-600 font-kollektif text-sm">
          {doctor.specialization}
        </Text>
      </View>

      <View className="flex-row items-center space-x-3">
        <TouchableOpacity
          onPress={onChatPress}
          className="p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCallPress}
          className="p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={24} color="#2D5A4F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ConsultationHeader: React.FC = () => {
  const handleBackPress = () => {
    router.back();
  };
  return (
    <>
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
          <View className="bg-smar-green p-6 max-w-64 rounded-3xl flex-1">
            <Text className="text-white font-kollektif text-2xl font-bold text-center">
              Pusat Konsultasi
            </Text>
          </View>
          <Image
            source={require("../../assets/images/png/consultation.png")}
            className="w-32 h-32"
          />
        </View>
      </View>
    </>
  );
};

export const ConsultationScreen: React.FC = () => {
  const {
    searchQuery: facilitySearchQuery,
    setSearchQuery: setFacilitySearchQuery,
    filteredFacilities,
  } = useSearchFacilities();
  const {
    searchQuery: doctorSearchQuery,
    setSearchQuery: setDoctorSearchQuery,
    filteredDoctors,
  } = useSearchDoctors();

  const handleFacilityPress = (facility: HealthFacility) => {
    console.log("Facility pressed:", facility.name);
    // TODO: Navigate to facility details or map
  };

  const handleChatPress = (doctor: Doctor) => {
    console.log("Chat with doctor:", doctor.name);
    // TODO: Open chat interface
  };

  const handleCallPress = (doctor: Doctor) => {
    console.log("Call doctor:", doctor.name);
    // TODO: Initiate call
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2D5A4F" />
      <SafeAreaView className="flex-1 bg-[#f1f8f5]">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
         <ConsultationHeader />
        <View>
          <SearchBar
              placeholder="Temukan fasilitas kesehatan terdekat"
              value={facilitySearchQuery}
              onChangeText={setFacilitySearchQuery}
            />
          <View className="bg-white mx-16 rounded-xl shadow-sm mb-6">
       

            <View className="max-h-auto">
              {filteredFacilities.map((facility) => (
                <FacilityItem
                  key={facility.id}
                  facility={facility}
                  onPress={() => handleFacilityPress(facility)}
                />
              ))}
            </View>
          </View>
        </View>

        <View>
          <SearchBar
              placeholder="Temukan dokter yang aktif saat ini"
              value={doctorSearchQuery}
              onChangeText={setDoctorSearchQuery}
            />
          <View className="bg-white mx-16 rounded-xl shadow-sm mb-6">
       

            <View className="max-h-auto">
              {filteredDoctors.map((doctor) => (
                <DoctorItem
                  key={doctor.id}
                  doctor={doctor}
                  onChatPress={() => handleChatPress(doctor)}
                  onCallPress={() => handleCallPress(doctor)}
                />
              ))}
            </View>
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
