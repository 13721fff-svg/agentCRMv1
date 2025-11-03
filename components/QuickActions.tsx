import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '@/lib/tw';
import Card from './Card';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  columns?: number;
}

export default function QuickActions({ actions, columns = 2 }: QuickActionsProps) {
  const { colors, tw } = useThemedStyles();
  const columnWidth = columns === 2 ? 'w-1/2' : columns === 3 ? 'w-1/3' : 'w-1/4';

  return (
    <View style={tw`flex-row flex-wrap -mx-1`}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={action.onPress}
          style={tw`${columnWidth} px-1 mb-2`}
          activeOpacity={0.7}
        >
          <Card>
            <View style={tw`items-center py-4`}>
              <View
                style={tw.style('w-14 h-14 rounded-full items-center justify-center mb-2', {
                  backgroundColor: action.color + '20',
                })}
              >
                {action.icon}
              </View>
              <Text style={[tw`text-sm font-medium text-center`, { color: colors.text }]}>
                {action.title}
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}
