import React from 'react';
import { View, Text } from 'react-native';
import tw from '@/lib/tw';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={tw`flex-1 items-center justify-center p-8`}>
      {icon && <View style={tw`mb-4`}>{icon}</View>}
      <Text style={tw`text-xl font-semibold text-neutral-900 mb-2 text-center`}>{title}</Text>
      {description && <Text style={tw`text-neutral-600 text-center mb-4`}>{description}</Text>}
      {action && <View style={tw`mt-4`}>{action}</View>}
    </View>
  );
}
