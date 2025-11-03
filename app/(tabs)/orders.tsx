import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Package,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
} from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useClientsStore } from '@/store/clientsStore';
import { supabase } from '@/lib/supabase';
import { OrderStatus } from '@/types';
import { realtimeService } from '@/services/realtimeService';
import { exportService } from '@/services/exportService';
import { Alert } from 'react-native';

const STATUS_CONFIG = {
  draft: {
    label: 'Чернетка',
    color: '#6b7280',
    bg: '#f3f4f6',
    icon: FileText,
  },
  pending: {
    label: 'Очікує',
    color: '#f59e0b',
    bg: '#fef3c7',
    icon: Clock,
  },
  confirmed: {
    label: 'Підтверджено',
    color: '#3b82f6',
    bg: '#dbeafe',
    icon: CheckCircle,
  },
  in_progress: {
    label: 'В роботі',
    color: '#8b5cf6',
    bg: '#ede9fe',
    icon: AlertCircle,
  },
  completed: {
    label: 'Завершено',
    color: '#16a34a',
    bg: '#dcfce7',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Скасовано',
    color: '#ef4444',
    bg: '#fee2e2',
    icon: XCircle,
  },
};

type FilterType = 'all' | OrderStatus;
type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useThemedStyles();
  const user = useAuthStore((state) => state.user);
  const { orders, setOrders } = useOrdersStore();
  const { clients } = useClientsStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!user?.org_id) return;

    const unsubscribe = realtimeService.subscribe('orders', user.org_id, {
      onInsert: (newOrder) => {
        setOrders([newOrder, ...orders]);
      },
      onUpdate: (updatedOrder) => {
        setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      },
      onDelete: (deletedOrder) => {
        setOrders(orders.filter((o) => o.id !== deletedOrder.id));
      },
    });

    return () => {
      unsubscribe();
    };
  }, [user?.org_id, orders]);

  const loadOrders = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const success = await exportService.exportOrdersToCSV(filteredOrders, clients);
      if (success) {
        Alert.alert('Успіх', 'Замовлення експортовано');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert('Помилка', 'Не вдалося експортувати замовлення');
    } finally {
      setExporting(false);
    }
  };

  const getClient = (clientId?: string) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId);
  };

  const filterByDate = (date: string) => {
    const orderDate = new Date(date);
    const now = new Date();

    switch (dateFilter) {
      case 'today':
        return orderDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      const client = getClient(order.client_id);
      const matchesSearch =
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.full_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;

      const matchesDate = filterByDate(order.created_at);

      return matchesSearch && matchesStatus && matchesDate;
    });

  const statusCounts = {
    all: orders.length,
    draft: orders.filter((o) => o.status === 'draft').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    in_progress: orders.filter((o) => o.status === 'in_progress').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header
          title={t('orders.title')}
          rightAction={
            <TouchableOpacity onPress={() => router.push('/orders/create')}>
              <Plus size={24} color="#0284c7" />
            </TouchableOpacity>
          }
        />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header
        title={t('orders.title')}
        rightAction={
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity onPress={handleExport} disabled={exporting}>
              <Download size={24} color="#0284c7" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <Filter size={24} color="#0284c7" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/orders/create')}>
              <Plus size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>
        }
      />

      {orders.length === 0 ? (
        <ScrollView
          contentContainerStyle={tw`flex-1 p-4`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0284c7"
            />
          }
        >
          <EmptyState
            icon={<Package size={48} color="#9ca3af" />}
            title={t('orders.noOrders')}
            description={t('orders.noOrdersDescription')}
            action={
              <Button
                title={t('orders.addOrder')}
                onPress={() => router.push('/orders/create')}
              />
            }
          />
        </ScrollView>
      ) : (
        <>
          <View style={tw`px-4 pt-4`}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Пошук замовлень..."
              icon={<Search size={20} color="#6b7280" />}
            />
          </View>

          {showFilters && (
            <View style={tw`px-4 pt-3`}>
              <Card style={tw`mb-0`}>
                <Text style={tw`text-sm font-semibold text-gray-900 mb-2`}>
                  Статус
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={tw`flex-row gap-2 mb-3`}>
                    <TouchableOpacity
                      onPress={() => setStatusFilter('all')}
                      style={tw`px-3 py-1.5 rounded-lg ${
                        statusFilter === 'all'
                          ? 'bg-blue-600'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <Text
                        style={tw`text-xs font-medium ${
                          statusFilter === 'all' ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        Всі ({statusCounts.all})
                      </Text>
                    </TouchableOpacity>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setStatusFilter(key as OrderStatus)}
                        style={tw`px-3 py-1.5 rounded-lg ${
                          statusFilter === key
                            ? 'bg-blue-600'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <Text
                          style={tw`text-xs font-medium ${
                            statusFilter === key ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {config.label} ({statusCounts[key as OrderStatus]})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={tw`text-sm font-semibold text-gray-900 mb-2`}>Дата</Text>
                <View style={tw`flex-row gap-2`}>
                  {[
                    { value: 'all' as DateFilter, label: 'Всі' },
                    { value: 'today' as DateFilter, label: 'Сьогодні' },
                    { value: 'week' as DateFilter, label: 'Тиждень' },
                    { value: 'month' as DateFilter, label: 'Місяць' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setDateFilter(option.value)}
                      style={tw`px-3 py-1.5 rounded-lg ${
                        dateFilter === option.value
                          ? 'bg-blue-600'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <Text
                        style={tw`text-xs font-medium ${
                          dateFilter === option.value ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            </View>
          )}

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
            {filteredOrders.length === 0 ? (
              <Card>
                <View style={tw`py-8 items-center`}>
                  <Search size={32} color="#9ca3af" />
                  <Text style={tw`text-gray-600 mt-2`}>Нічого не знайдено</Text>
                </View>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const client = getClient(order.client_id);
                const statusConfig = STATUS_CONFIG[order.status];

                return (
                  <TouchableOpacity
                    key={order.id}
                    onPress={() => router.push(`/orders/${order.id}`)}
                    activeOpacity={0.7}
                  >
                    <Card style={tw`mb-3`}>
                      <View style={tw`flex-row items-start justify-between mb-2`}>
                        <View style={tw`flex-1`}>
                          <Text
                            style={tw`text-base font-semibold text-gray-900 mb-1`}
                            numberOfLines={1}
                          >
                            {order.title}
                          </Text>
                          {client && (
                            <Text style={tw`text-sm text-gray-600 mb-2`}>
                              {client.full_name}
                            </Text>
                          )}
                        </View>
                        <ChevronRight size={20} color="#9ca3af" style={tw`ml-2`} />
                      </View>

                      <View style={tw`flex-row items-center justify-between`}>
                        <View
                          style={[
                            tw`flex-row items-center px-2 py-1 rounded-full`,
                            { backgroundColor: statusConfig.bg },
                          ]}
                        >
                          {React.createElement(statusConfig.icon, {
                            size: 12,
                            color: statusConfig.color,
                          })}
                          <Text
                            style={[
                              tw`text-xs font-medium ml-1`,
                              { color: statusConfig.color },
                            ]}
                          >
                            {statusConfig.label}
                          </Text>
                        </View>

                        {order.amount && (
                          <Text style={tw`text-base font-bold text-gray-900`}>
                            ₴{order.amount.toLocaleString('uk-UA')}
                          </Text>
                        )}
                      </View>

                      {order.due_date && (
                        <Text style={tw`text-xs text-gray-500 mt-2`}>
                          До:{' '}
                          {new Date(order.due_date).toLocaleDateString('uk-UA', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      )}
                    </Card>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}
