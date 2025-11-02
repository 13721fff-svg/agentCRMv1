import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import tw from '@/lib/tw';
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
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} color="#16a34a" />;
      case 'down':
        return <TrendingDown size={12} color="#ef4444" />;
      default:
        return <Minus size={12} color="#6b7280" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
        <Text style={tw`text-2xl font-bold text-gray-900 mb-1`}>{value}</Text>
        <Text style={tw`text-xs text-gray-600 mb-1`}>{label}</Text>
        {change !== undefined && (
          <View style={tw`flex-row items-center`}>
            {getTrendIcon()}
            <Text style={tw`text-xs ${getTrendColor()} ml-1`}>
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
