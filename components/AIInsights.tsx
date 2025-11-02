import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Lightbulb, AlertTriangle, Info, X, ChevronRight } from 'lucide-react-native';
import tw from '@/lib/tw';
import Card from './Card';
import { AIInsight } from '@/store/dashboardStore';

interface AIInsightsProps {
  insights: AIInsight[];
  onDismiss?: (id: string) => void;
}

export default function AIInsights({ insights, onDismiss }: AIInsightsProps) {
  const router = useRouter();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'recommendation':
        return <Lightbulb size={20} color="#8b5cf6" />;
      default:
        return <Info size={20} color="#0284c7" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          iconBg: '#fef3c7',
        };
      case 'recommendation':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-900',
          iconBg: '#f3e8ff',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          iconBg: '#dbeafe',
        };
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return (
        <View style={tw`bg-red-100 px-2 py-0.5 rounded-full`}>
          <Text style={tw`text-xs font-medium text-red-700`}>Важливо</Text>
        </View>
      );
    }
    return null;
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <View>
      {insights.map((insight) => {
        const colors = getInsightColor(insight.type);
        return (
          <Card key={insight.id} style={tw`mb-3 ${colors.bg} border ${colors.border}`}>
            <View style={tw`flex-row`}>
              <View
                style={tw.style('w-10 h-10 rounded-full items-center justify-center mr-3', {
                  backgroundColor: colors.iconBg,
                })}
              >
                {getInsightIcon(insight.type)}
              </View>

              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center justify-between mb-1`}>
                  <Text style={tw`text-base font-semibold ${colors.text}`}>
                    {insight.title}
                  </Text>
                  {onDismiss && (
                    <TouchableOpacity onPress={() => onDismiss(insight.id)}>
                      <X size={16} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>

                {getPriorityBadge(insight.priority)}

                <Text style={tw`text-sm ${colors.text} mt-1 opacity-80`}>
                  {insight.message}
                </Text>

                {insight.action && (
                  <TouchableOpacity
                    onPress={() => router.push(insight.action!.route as any)}
                    style={tw`flex-row items-center mt-3`}
                  >
                    <Text style={tw`text-sm font-medium ${colors.text}`}>
                      {insight.action.label}
                    </Text>
                    <ChevronRight size={16} color={colors.text.replace('text-', '#')} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}
