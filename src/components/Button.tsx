import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}) => {
  const baseClasses = "py-4 px-6 rounded-xl flex-row items-center justify-center";
  const primaryClasses = "bg-smar-accent";
  const secondaryClasses = "bg-smar-green";
  const disabledClasses = "opacity-50";

  const buttonClasses = `${baseClasses} ${
    variant === 'primary' ? primaryClasses : secondaryClasses
  } ${disabled ? disabledClasses : ''}`;

  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text className="text-white text-lg font-kollektif font-semibold">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
