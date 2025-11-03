import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useThemedStyles } from '@/lib/tw';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, ...props }: InputProps) {
  const { colors, tw } = useThemedStyles();

  return (
    <View style={tw`w-full mb-4`}>
      {label && <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          tw`flex-row items-center rounded-lg px-4 py-3`,
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        {icon && <View style={tw`mr-2`}>{icon}</View>}
        <TextInput
          style={[tw`flex-1 text-base`, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
      </View>
      {error && <Text style={[tw`text-sm mt-1`, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}
