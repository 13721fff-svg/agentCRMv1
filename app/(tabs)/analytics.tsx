import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Target,
  Download,
  Calendar,
  Sparkles,
  BarChart3,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LineChart from '@/components/LineChart';
import BarChart from '@/components/BarChart';
import { useAuthStore } from '@/store/authStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { supabase } from '@/lib/supabase';
import { exportService } from '@/services/exportService';

type Period = 'day' | 'week' | 'month' | 'year';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const { colors } = useThemedStyles();
  const user = useAuthStore((state) => state.user);
  const { kpis, revenueByMonth, ordersByStatus, topClients, loading, refresh } = useAnalyticsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('month');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [period, user?.org_id]);

  const loadAnalyticsData = async () => {
    if (!user?.org_id) return;
    await refresh(user.org_id);
  };

  const handleRefresh = async () => {
    if (!user?.org_id) return;
    setRefreshing(true);
    await refresh(user.org_id);
    setRefreshing(false);
  };

  const calculateMetrics = () => {
    return {
      revenue: {
        value: kpis.totalRevenue,
        change: 12,
      },
      orders: {
        value: kpis.totalOrders,
        change: 8,
      },
      clients: {
        value: kpis.totalClients,
        change: 5,
      },
      conversion: {
        value: `${kpis.conversionRate.toFixed(1)}%`,
        change: 3,
      },
    };
  };

  const getChartData = () => {
    return revenueByMonth.length > 0
      ? revenueByMonth
      : [
          { label: 'Січ', value: 0 },
          { label: 'Лют', value: 0 },
          { label: 'Бер', value: 0 },
        ];
  };

  const getOrdersChartData = () => {
    return ordersByStatus.length > 0
      ? ordersByStatus
      : [
          { label: 'Очікує', value: 0, color: '#f59e0b' },
          { label: 'У роботі', value: 0, color: '#0284c7' },
          { label: 'Виконано', value: 0, color: '#16a34a' },
          { label: 'Скасовано', value: 0, color: '#ef4444' },
        ];
  };

  const generateAIForecast = () => {
    const metrics = calculateMetrics();
    const revenueGrowth = metrics.revenue.change;

    let forecast = '';
    let prediction = 0;

    if (revenueGrowth > 10) {
      forecast = 'Відмінні результати! За поточними темпами очікується значне зростання.';
      prediction = 15;
    } else if (revenueGrowth > 0) {
      forecast = 'Стабільне зростання. Рекомендуємо активізувати маркетинг.';
      prediction = 8;
    } else {
      forecast = 'Помітне уповільнення. Час переглянути стратегію продажів.';
      prediction = -3;
    }

    return { forecast, prediction };
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true);

      const success = await exportService.exportAnalyticsToCSV({
        kpis,
        revenueByMonth,
        ordersByStatus,
        topClients,
      });

      if (success) {
        Alert.alert('Успіх', 'Звіт експортовано');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert('Помилка', 'Не вдалося експортувати звіт');
    } finally {
      setExporting(false);
    }
  };

  const metrics = calculateMetrics();
  const revenueChartData = getChartData();
  const ordersChartData = getOrdersChartData();
  const { forecast, prediction } = generateAIForecast();

  if (loading) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title={t('analytics.title')} />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header title="Аналітика" />

      <ScrollView
        contentContainerStyle={tw`p-4`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0284c7"
          />
        }
      >
        <View style={tw`mb-4`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <Text style={tw`text-lg font-semibold text-gray-900`}>{t('analytics.period')}</Text>
            <TouchableOpacity
              onPress={() => handleExport('csv')}
              disabled={exporting}
              style={tw`flex-row items-center bg-blue-50 px-3 py-2 rounded-lg`}
            >
              <Download size={16} color="#0284c7" />
              <Text style={tw`text-sm font-medium text-blue-700 ml-1`}>{t('analytics.export')}</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row gap-2`}>
            {[
              { id: 'day', label: t('analytics.day') },
              { id: 'week', label: t('analytics.week') },
              { id: 'month', label: t('analytics.month') },
              { id: 'year', label: t('analytics.year') },
            ].map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setPeriod(p.id as Period)}
                style={tw`flex-1 px-3 py-2 rounded-lg ${
                  period === p.id ? 'bg-blue-600' : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  style={tw`text-sm font-medium text-center ${
                    period === p.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
            {t('analytics.mainMetrics')}
          </Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            <View style={tw`flex-1 min-w-36`}>
              <Card>
                <View style={tw`flex-row items-center justify-between mb-2`}>
                  <View
                    style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center`}
                  >
                    <DollarSign size={20} color="#16a34a" />
                  </View>
                  <View style={tw`flex-row items-center`}>
                    {metrics.revenue.change > 0 ? (
                      <TrendingUp size={14} color="#16a34a" />
                    ) : (
                      <TrendingDown size={14} color="#ef4444" />
                    )}
                    <Text
                      style={tw`text-xs font-medium ml-1 ${
                        metrics.revenue.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metrics.revenue.change > 0 ? '+' : ''}
                      {metrics.revenue.change}%
                    </Text>
                  </View>
                </View>
                <Text style={tw`text-2xl font-bold text-gray-900`}>
                  ₴{(metrics.revenue.value / 1000).toFixed(1)}K
                </Text>
                <Text style={tw`text-sm text-gray-600`}>{t('analytics.revenue')}</Text>
              </Card>
            </View>

            <View style={tw`flex-1 min-w-36`}>
              <Card>
                <View style={tw`flex-row items-center justify-between mb-2`}>
                  <View
                    style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center`}
                  >
                    <ShoppingBag size={20} color="#0284c7" />
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <TrendingUp size={14} color="#16a34a" />
                    <Text style={tw`text-xs font-medium text-green-600 ml-1`}>
                      +{metrics.orders.change}%
                    </Text>
                  </View>
                </View>
                <Text style={tw`text-2xl font-bold text-gray-900`}>
                  {metrics.orders.value}
                </Text>
                <Text style={tw`text-sm text-gray-600`}>{t('analytics.orders')}</Text>
              </Card>
            </View>

            <View style={tw`flex-1 min-w-36`}>
              <Card>
                <View style={tw`flex-row items-center justify-between mb-2`}>
                  <View
                    style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center`}
                  >
                    <Users size={20} color="#8b5cf6" />
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <TrendingUp size={14} color="#16a34a" />
                    <Text style={tw`text-xs font-medium text-green-600 ml-1`}>
                      +{metrics.clients.change}%
                    </Text>
                  </View>
                </View>
                <Text style={tw`text-2xl font-bold text-gray-900`}>
                  {metrics.clients.value}
                </Text>
                <Text style={tw`text-sm text-gray-600`}>{t('analytics.newClients')}</Text>
              </Card>
            </View>

            <View style={tw`flex-1 min-w-36`}>
              <Card>
                <View style={tw`flex-row items-center justify-between mb-2`}>
                  <View
                    style={tw`w-10 h-10 rounded-full bg-orange-100 items-center justify-center`}
                  >
                    <Target size={20} color="#f59e0b" />
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <TrendingUp size={14} color="#16a34a" />
                    <Text style={tw`text-xs font-medium text-green-600 ml-1`}>
                      +{metrics.conversion.change}%
                    </Text>
                  </View>
                </View>
                <Text style={tw`text-2xl font-bold text-gray-900`}>
                  {metrics.conversion.value}
                </Text>
                <Text style={tw`text-sm text-gray-600`}>{t('analytics.conversion')}</Text>
              </Card>
            </View>
          </View>
        </View>

        {revenueChartData.length > 0 && (
          <Card style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Calendar size={20} color="#0284c7" />
              <Text style={tw`text-lg font-semibold text-gray-900 ml-2`}>
                {t('analytics.revenueDynamics')}
              </Text>
            </View>
            <LineChart data={revenueChartData} height={220} color="#0284c7" />
          </Card>
        )}

        {ordersChartData.length > 0 && (
          <Card style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-3`}>
              <BarChart3 size={20} color="#8b5cf6" />
              <Text style={tw`text-lg font-semibold text-gray-900 ml-2`}>
                {t('analytics.ordersDistribution')}
              </Text>
            </View>
            <BarChart data={ordersChartData} height={220} />
          </Card>
        )}

        <Card style={tw`mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200`}>
          <View style={tw`flex-row items-start mb-3`}>
            <View style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center`}>
              <Sparkles size={20} color="#8b5cf6" />
            </View>
            <View style={tw`flex-1 ml-3`}>
              <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                {t('analytics.aiForecast')}
              </Text>
              <Text style={tw`text-sm text-gray-700 mb-3`}>{forecast}</Text>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-sm text-gray-600 mr-2`}>
                  {t('analytics.expectedGrowth')}
                </Text>
                <View
                  style={tw`flex-row items-center px-3 py-1 rounded-full ${
                    prediction > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {prediction > 0 ? (
                    <TrendingUp size={14} color="#16a34a" />
                  ) : (
                    <TrendingDown size={14} color="#ef4444" />
                  )}
                  <Text
                    style={tw`text-sm font-semibold ml-1 ${
                      prediction > 0 ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {prediction > 0 ? '+' : ''}
                    {prediction}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <View style={tw`flex-row gap-2 mb-4`}>
          <Button
            title={t('analytics.exportCSV')}
            onPress={() => handleExport('csv')}
            loading={exporting}
            variant="secondary"
            style={tw`flex-1`}
          />
          <Button
            title={t('analytics.exportPDF')}
            onPress={() => handleExport('pdf')}
            loading={exporting}
            variant="secondary"
            style={tw`flex-1`}
          />
        </View>
      </ScrollView>
    </View>
  );
}
