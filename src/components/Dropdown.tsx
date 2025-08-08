import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  error?: string;
  label?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  options,
  value,
  onSelect,
  error,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
    setIsFocused(false);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-smar-green font-kollektif text-sm mb-2 font-medium">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        className={`flex-row items-center justify-between bg-white border rounded-xl px-4 py-4 ${
          isFocused || isOpen ? 'border-smar-green' : 'border-gray-200'
        } ${error ? 'border-red-500' : ''}`}
        onPress={() => {
          setIsOpen(true);
          setIsFocused(true);
        }}
        activeOpacity={0.7}
      >
        <Text 
          className={`font-kollektif text-base ${
            selectedOption ? 'text-gray-800' : 'text-gray-400'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#9CA3AF" 
        />
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 font-kollektif text-sm mt-1">{error}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsOpen(false);
          setIsFocused(false);
        }}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center px-4"
          onPress={() => {
            setIsOpen(false);
            setIsFocused(false);
          }}
        >
          <Pressable 
            className="bg-white rounded-xl max-h-80 mx-4"
            onPress={() => {}} // Prevent modal from closing when tapping inside
          >
            <View className="p-4 border-b border-gray-200">
              <Text className="font-kollektif font-semibold text-lg text-gray-800">
                {label || placeholder}
              </Text>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`p-4 border-b border-gray-100 ${
                    item.value === value ? 'bg-smar-light' : ''
                  }`}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <Text 
                    className={`font-kollektif text-base ${
                      item.value === value ? 'text-smar-green font-medium' : 'text-gray-800'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
