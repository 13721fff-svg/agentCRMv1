import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/tw';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();
  const { colors, tw } = useThemedStyles();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        tw`px-4 py-3 flex-row items-center justify-between`,
        {
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <View style={tw`flex-row items-center flex-1`}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={tw`mr-3`}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>{title}</Text>
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
