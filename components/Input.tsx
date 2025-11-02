import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import tw from '@/lib/tw';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, ...props }: InputProps) {
  return (
    <View style={tw`w-full mb-4`}>
      {label && <Text style={tw`text-neutral-700 font-medium mb-2`}>{label}</Text>}
      <View style={tw`flex-row items-center border border-neutral-300 rounded-lg px-4 py-3 bg-white`}>
        {icon && <View style={tw`mr-2`}>{icon}</View>}
        <TextInput
          style={tw`flex-1 text-base text-neutral-900`}
          placeholderTextColor="#a3a3a3"
          {...props}
        />
      </View>
      {error && <Text style={tw`text-error-500 text-sm mt-1`}>{error}</Text>}
    </View>
  );
}
