import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '@/lib/tw';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export default function Card({ children, onPress, style }: CardProps) {
  const { colors, tw } = useThemedStyles();
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        tw`rounded-lg p-4 shadow-sm`,
        {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
}
