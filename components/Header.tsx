import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import tw from '@/lib/tw';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={tw`bg-white border-b border-neutral-200 px-4 py-3 flex-row items-center justify-between`}>
      <View style={tw`flex-row items-center flex-1`}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={tw`mr-3`}>
            <ArrowLeft size={24} color="#171717" />
          </TouchableOpacity>
        )}
        <Text style={tw`text-xl font-bold text-neutral-900`}>{title}</Text>
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
