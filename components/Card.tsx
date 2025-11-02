import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import tw from '@/lib/tw';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export default function Card({ children, onPress, style }: CardProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={tw.style('bg-white rounded-lg p-4 shadow-sm border border-neutral-200', style)}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
}
