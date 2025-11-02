import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Users, ShoppingBag } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';

export default function AnalyticsScreen() {
  const { t } = useTranslation();

  const metrics = [
    {
      label: 'Загальний дохід',
      value: '₴45,230',
      change: '+12.5%',
      icon: DollarSign,
      color: '#22c55e',
      positive: true,
    },
    {
      label: 'Нові клієнти',
      value: '24',
      change: '+8.2%',
      icon: Users,
      color: '#0ea5e9',
      positive: true,
    },
    {
      label: 'Замовлення',
      value: '156',
      change: '+15.3%',
      icon: ShoppingBag,
      color: '#f59e0b',
      positive: true,
    },
    {
      label: 'Конверсія',
      value: '67%',
      change: '-2.1%',
      icon: TrendingUp,
      color: '#ef4444',
      positive: false,
    },
  ];

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header title={t('analytics.title')} />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-semibold text-neutral-900 mb-3`}>
            Загальна статистика
          </Text>
          <View style={tw`flex-row flex-wrap`}>
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} style={tw`w-[48%] m-1`}>
                  <View style={tw`py-2`}>
                    <View
                      style={tw.style(
                        'w-10 h-10 rounded-full items-center justify-center mb-2',
                        { backgroundColor: metric.color + '20' }
                      )}
                    >
                      <Icon size={20} color={metric.color} />
                    </View>
                    <Text style={tw`text-2xl font-bold text-neutral-900 mb-1`}>
                      {metric.value}
                    </Text>
                    <Text style={tw`text-sm text-neutral-600 mb-1`}>{metric.label}</Text>
                    <Text
                      style={tw`text-xs font-medium ${
                        metric.positive ? 'text-success-600' : 'text-error-600'
                      }`}
                    >
                      {metric.change}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-semibold text-neutral-900 mb-3`}>
            {t('analytics.reports')}
          </Text>
          <Card>
            <Text style={tw`text-neutral-600 text-center py-4`}>
              Графіки та звіти з'являться тут
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
