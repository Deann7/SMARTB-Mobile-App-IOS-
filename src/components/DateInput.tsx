import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

interface DateInputProps {
  value: {
    day: string;
    month: string;
    year: string;
  };
  onChange: (value: { day: string; month: string; year: string }) => void;
  label?: string;
  error?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label,
  error,
}) => {
  const [focused, setFocused] = useState<'day' | 'month' | 'year' | null>(null);

  const handleChange = (field: 'day' | 'month' | 'year', text: string) => {
    // Limit input lengths
    let limitedText = text;
    if (field === 'day' || field === 'month') {
      limitedText = text.slice(0, 2);
    } else if (field === 'year') {
      limitedText = text.slice(0, 4);
    }

    onChange({
      ...value,
      [field]: limitedText,
    });
  };

  const getFieldClass = (field: 'day' | 'month' | 'year') => {
    const baseClass = "bg-white border rounded-full px-4 py-3 text-center font-kollektif text-base";
    const focusClass = focused === field ? 'border-smar-green' : 'border-gray-200';
    const errorClass = error ? 'border-red-500' : '';
    
    return `${baseClass} ${focusClass} ${errorClass}`;
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-smar-green font-kollektif text-sm mb-2 font-medium">
          {label}
        </Text>
      )}
      
      <View className="flex-row space-x-3 items-center">
        {/* Day Input */}
        <View className="flex-1">
          <TextInput
            className={getFieldClass('day')}
            placeholder="DD"
            placeholderTextColor="#9CA3AF"
            value={value.day}
            onChangeText={(text) => handleChange('day', text)}
            keyboardType="numeric"
            maxLength={2}
            onFocus={() => setFocused('day')}
            onBlur={() => setFocused(null)}
          />
        </View>

        {/* Separator */}
        <Text className="text-gray-400 font-kollektif text-lg">/</Text>

        {/* Month Input */}
        <View className="flex-1">
          <TextInput
            className={getFieldClass('month')}
            placeholder="MM"
            placeholderTextColor="#9CA3AF"
            value={value.month}
            onChangeText={(text) => handleChange('month', text)}
            keyboardType="numeric"
            maxLength={2}
            onFocus={() => setFocused('month')}
            onBlur={() => setFocused(null)}
          />
        </View>

        {/* Separator */}
        <Text className="text-gray-400 font-kollektif text-lg">/</Text>

        {/* Year Input */}
        <View className="flex-2">
          <TextInput
            className={getFieldClass('year')}
            placeholder="YYYY"
            placeholderTextColor="#9CA3AF"
            value={value.year}
            onChangeText={(text) => handleChange('year', text)}
            keyboardType="numeric"
            maxLength={4}
            onFocus={() => setFocused('year')}
            onBlur={() => setFocused(null)}
          />
        </View>
      </View>

      {error && (
        <Text className="text-red-500 font-kollektif text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};
