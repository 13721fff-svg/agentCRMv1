import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  Users,
  ShoppingBag,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Target,
  Megaphone,
  CheckSquare,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import KPICard from '@/components/KPICard';
import QuickActions from '@/components/QuickActions';
import RecentOrders from '@/components/RecentOrders';
import AIInsights from '@/components/AIInsights';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useClientsStore } from '@/store/clientsStore';
import { useMeetingsStore } from '@/store/meetingsStore';
import { useCampaignsStore } from '@/store/campaignsStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { orders, setOrders } = useOrdersStore();
  const { clients, setClients } = useClientsStore();
  const { meetings, setMeetings } = useMeetingsStore();
  const { campaigns, setCampaigns } = useCampaignsStore();
  const { insights, removeInsight, setInsights } = useDashboardStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    generateAIInsights();
  }, []);

  const loadDashboardData = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);

      const [ordersData, clientsData, meetingsData, campaignsData] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('clients').select('*').eq('org_id', user.org_id),
        supabase
          .from('meetings')
          .select('*')
          .eq('org_id', user.org_id)
          .gte('start_time', new Date().toISOString()),
        supabase.from('campaigns').select('*').eq('org_id', user.org_id),
      ]);

      if (ordersData.data) setOrders(ordersData.data);
      if (clientsData.data) setClients(clientsData.data);
      if (meetingsData.data) setMeetings(meetingsData.data);
      if (campaignsData.data) setCampaigns(campaignsData.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    generateAIInsights();
    setRefreshing(false);
  };

  const generateAIInsights = () => {
    const newInsights = [];

    if (meetings.length > 0 && meetings.some((m) => {
      const meetingDate = new Date(m.start_time);
      const now = new Date();
      const hoursDiff = (meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 0 && hoursDiff < 24;
    })) {
      newInsights.push({
        id: 'meeting-reminder',
        type: 'recommendation' as const,
        title: 'Зустріч сьогодні',
        message: 'У вас заплановано зустріч на сьогодні. Не забудьте підготуватись!',
        action: {
          label: 'Переглянути зустрічі',
          route: '/meetings',
        },
        priority: 'high' as const,
        created_at: new Date().toISOString(),
      });
    }

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    if (pendingOrders > 5) {
      newInsights.push({
        id: 'pending-orders',
        type: 'warning' as const,
        title: 'Багато очікуючих замовлень',
        message: `У вас ${pendingOrders} замовлень в очікуванні. Рекомендуємо їх обробити.`,
        action: {
          label: 'Переглянути замовлення',
          route: '/(tabs)/orders',
        },
        priority: 'medium' as const,
        created_at: new Date().toISOString(),
      });
    }

    if (clients.length > 0 && orders.length > 0) {
      const clientsWithoutOrders = clients.filter(
        (c) => !orders.some((o) => o.client_id === c.id)
      ).length;
      if (clientsWithoutOrders > 0) {
        newInsights.push({
          id: 'inactive-clients',
          type: 'tip' as const,
          title: 'Неактивні клієнти',
          message: `${clientsWithoutOrders} клієнтів не мають замовлень. Зв'яжіться з ними!`,
          action: {
            label: 'Переглянути клієнтів',
            route: '/(tabs)/clients',
          },
          priority: 'low' as const,
          created_at: new Date().toISOString(),
        });
      }
    }

    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
    if (activeCampaigns === 0 && clients.length > 10) {
      newInsights.push({
        id: 'no-campaigns',
        type: 'recommendation' as const,
        title: 'Створіть маркетингову кампанію',
        message: 'У вас немає активних кампаній. Час залучити нових клієнтів!',
        action: {
          label: 'Створити кампанію',
          route: '/campaigns',
        },
        priority: 'medium' as const,
        created_at: new Date().toISOString(),
      });
    }

    setInsights(newInsights);
  };

  const calculateKPIs = () => {
    const totalRevenue = orders
      .filter((o) => o.status === 'completed' && o.amount)
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const totalOrders = orders.length;
    const conversionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0';

    const lastMonthRevenue = orders
      .filter((o) => {
        const orderDate = new Date(o.created_at);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return o.status === 'completed' && orderDate > lastMonth && o.amount;
      })
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const revenueChange = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    return {
      revenue: { value: `₴${(totalRevenue / 1000).toFixed(1)}K`, change: Number(revenueChange.toFixed(1)) },
      orders: { value: totalOrders, change: 12 },
      clients: { value: clients.length, change: 8 },
      conversion: { value: `${conversionRate}%`, change: 5 },
    };
  };

  const kpis = calculateKPIs();

  const getQuickActions = () => {
    const allActions = [
      {
        id: 'new-order',
        title: 'Нове замовлення',
        icon: <Plus size={24} color="#0284c7" />,
        color: '#0284c7',
        onPress: () => router.push('/orders/create'),
        roles: ['individual', 'small', 'medium'],
      },
      {
        id: 'new-client',
        title: 'Додати клієнта',
        icon: <Users size={24} color="#16a34a" />,
        color: '#16a34a',
        onPress: () => router.push('/clients/create'),
        roles: ['individual', 'small', 'medium'],
      },
      {
        id: 'new-meeting',
        title: 'Нова зустріч',
        icon: <Calendar size={24} color="#8b5cf6" />,
        color: '#8b5cf6',
        onPress: () => router.push('/meetings/create'),
        roles: ['small', 'medium'],
      },
      {
        id: 'new-campaign',
        title: 'Кампанія',
        icon: <Megaphone size={24} color="#f59e0b" />,
        color: '#f59e0b',
        onPress: () => router.push('/campaigns'),
        roles: ['small', 'medium'],
      },
      {
        id: 'catalog',
        title: 'Каталог',
        icon: <ShoppingBag size={24} color="#ef4444" />,
        color: '#ef4444',
        onPress: () => router.push('/(tabs)/catalog'),
        roles: ['citizen'],
      },
      {
        id: 'tasks',
        title: 'Завдання',
        icon: <CheckSquare size={24} color="#06b6d4" />,
        color: '#06b6d4',
        onPress: () => router.push('/kpi'),
        roles: ['individual', 'small', 'medium'],
      },
    ];

    return allActions.filter(
      (action) => !action.roles || action.roles.includes(user?.role || 'citizen')
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="Головна" />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Головна" />

      <ScrollView
        contentContainerStyle={tw`p-4`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0284c7" />
        }
      >
        <View style={tw`mb-6`}>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-1`}>
            Вітаємо, {user?.full_name?.split(' ')[0] || user?.full_name}! 👋
          </Text>
          <Text style={tw`text-gray-600`}>
            {user?.role === 'citizen'
              ? 'Знайдіть потрібні послуги'
              : 'Керуйте своїм бізнесом ефективно'}
          </Text>
        </View>

        {insights.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>💡 AI-підказки</Text>
            <AIInsights insights={insights} onDismiss={removeInsight} />
          </View>
        )}

        {user?.role !== 'citizen' && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>📊 Основні показники</Text>
            <View style={tw`flex-row mb-2`}>
              <KPICard
                label="Дохід"
                value={kpis.revenue.value}
                change={kpis.revenue.change}
                trend={kpis.revenue.change > 0 ? 'up' : kpis.revenue.change < 0 ? 'down' : 'stable'}
                icon={<DollarSign size={24} color="#0284c7" />}
                color="#0284c7"
                onPress={() => router.push('/(tabs)/analytics')}
              />
              <KPICard
                label="Замовлення"
                value={kpis.orders.value}
                change={kpis.orders.change}
                trend="up"
                icon={<Package size={24} color="#16a34a" />}
                color="#16a34a"
                onPress={() => router.push('/(tabs)/orders')}
              />
            </View>
            <View style={tw`flex-row`}>
              <KPICard
                label="Клієнти"
                value={kpis.clients.value}
                change={kpis.clients.change}
                trend="up"
                icon={<Users size={24} color="#8b5cf6" />}
                color="#8b5cf6"
                onPress={() => router.push('/(tabs)/clients')}
              />
              <KPICard
                label="Конверсія"
                value={kpis.conversion.value}
                change={kpis.conversion.change}
                trend="up"
                icon={<Target size={24} color="#f59e0b" />}
                color="#f59e0b"
                onPress={() => router.push('/(tabs)/analytics')}
              />
            </View>
          </View>
        )}

        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>⚡ Швидкі дії</Text>
          <QuickActions actions={getQuickActions()} columns={2} />
        </View>

        {user?.role !== 'citizen' && (
          <View style={tw`mb-6`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <Text style={tw`text-lg font-semibold text-gray-900`}>📦 Останні замовлення</Text>
              {orders.length > 0 && (
                <Text style={tw`text-sm text-blue-700 font-medium`}>Всього: {orders.length}</Text>
              )}
            </View>
            <RecentOrders orders={orders} limit={5} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
