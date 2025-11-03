import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useThemedStyles } from '@/lib/tw';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const { colors, tw } = useThemedStyles();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.textSecondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
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
    if (variant === 'outline') return colors.primary;
    if (variant === 'ghost') return colors.primary;
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      style={[
        tw`${getSizeStyles()} rounded-lg items-center justify-center ${
          fullWidth ? 'w-full' : ''
        } ${disabled || loading ? 'opacity-50' : ''}`,
        getVariantStyles(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#ffffff'} />
      ) : (
        <View style={tw`flex-row items-center`}>
          {leftIcon && <View style={tw`mr-2`}>{leftIcon}</View>}
          <Text style={[tw`font-semibold text-base`, { color: getTextColor() }]}>{title}</Text>
          {rightIcon && <View style={tw`ml-2`}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}
