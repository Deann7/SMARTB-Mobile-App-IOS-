import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

interface MultilineInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  label?: string;
  numberOfLines?: number;
}

export const MultilineInput: React.FC<MultilineInputProps> = ({
  placeholder,
  value,
  onChangeText,
  error,
  label,
  numberOfLines = 4,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-smar-green font-kollektif text-sm mb-2 font-medium">
          {label}
        </Text>
      )}
      
      <View
        className={`bg-white border rounded-xl px-4 py-4 ${
          isFocused ? 'border-smar-green' : 'border-gray-200'
        } ${error ? 'border-red-500' : ''}`}
      >
        <TextInput
          className="font-kollektif text-base text-gray-800 min-h-[100px]"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      
      {error && (
        <Text className="text-red-500 font-kollektif text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};
