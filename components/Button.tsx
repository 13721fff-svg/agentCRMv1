import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import tw from '@/lib/tw';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600';
      case 'secondary':
        return 'bg-neutral-600';
      case 'outline':
        return 'bg-transparent border-2 border-primary-600';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-primary-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2';
      case 'md':
        return 'px-4 py-3';
      case 'lg':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return 'text-primary-600';
    if (variant === 'ghost') return 'text-primary-600';
    return 'text-white';
  };

  return (
    <TouchableOpacity
      style={[tw`${getVariantStyles()} ${getSizeStyles()} rounded-lg items-center justify-center ${
        fullWidth ? 'w-full' : ''
      } ${disabled || loading ? 'opacity-50' : ''}`, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#0284c7' : 'white'} />
      ) : (
        <Text style={tw`${getTextColor()} font-semibold text-base`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
