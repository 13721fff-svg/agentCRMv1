import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/tw';
import Card from './Card';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}

export default function KPICard({
  label,
  value,
  change,
  trend = 'stable',
  icon,
  color,
  onPress,
}: KPICardProps) {
  const { colors, tw } = useThemedStyles();

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} color={colors.success} />;
      case 'down':
        return <TrendingDown size={12} color={colors.error} />;
      default:
        return <Minus size={12} color={colors.textSecondary} />;
    }
  };

  const getTrendColorValue = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const content = (
    <Card style={tw`flex-1`}>
      <View style={tw`items-center py-3`}>
        <View
          style={tw.style('w-12 h-12 rounded-full items-center justify-center mb-2', {
            backgroundColor: color + '20',
          })}
        >
          {icon}
        </View>
        <Text style={[tw`text-2xl font-bold mb-1`, { color: colors.text }]}>{value}</Text>
        <Text style={[tw`text-xs mb-1`, { color: colors.textSecondary }]}>{label}</Text>
        {change !== undefined && (
          <View style={tw`flex-row items-center`}>
            {getTrendIcon()}
            <Text style={[tw`text-xs ml-1`, { color: getTrendColorValue() }]}>
              {change > 0 ? '+' : ''}
              {change}%
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={tw`flex-1 mx-1`}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={tw`flex-1 mx-1`}>{content}</View>;
}
