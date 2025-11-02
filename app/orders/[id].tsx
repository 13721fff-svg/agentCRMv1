import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Package,
  Calendar,
  DollarSign,
  User,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useOrdersStore } from '@/store/ordersStore';
import { useClientsStore } from '@/store/clientsStore';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, setOrders } = useOrdersStore();
  const { clients } = useClientsStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const foundOrder = orders.find((o) => o.id === id);

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити замовлення');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Видалити замовлення',
      'Ви впевнені, що хочете видалити це замовлення?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('orders').delete().eq('id', id);
              if (error) throw error;

              setOrders(orders.filter((o) => o.id !== id));
              router.back();
            } catch (error) {
              console.error('Error deleting order:', error);
              Alert.alert('Помилка', 'Не вдалося видалити замовлення');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      const updatedOrder = { ...order!, status: newStatus as any };
      setOrder(updatedOrder);
      setOrders(orders.map((o) => (o.id === id ? updatedOrder : o)));
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Помилка', 'Не вдалося оновити статус');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#16a34a" />;
      case 'cancelled':
        return <XCircle size={20} color="#ef4444" />;
      case 'in_progress':
        return <Clock size={20} color="#0284c7" />;
      default:
        return <AlertCircle size={20} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Виконано';
      case 'cancelled':
        return 'Скасовано';
      case 'in_progress':
        return 'У роботі';
      case 'pending':
        return 'Очікує';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getClient = () => {
    if (!order?.client_id) return null;
    return clients.find((c) => c.id === order.client_id);
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="Завантаження..." showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="Помилка" showBack />
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Package size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 mt-4`}>Замовлення не знайдено</Text>
        </View>
      </View>
    );
  }

  const client = getClient();

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header
        title="Деталі замовлення"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-start justify-between mb-4`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>{order.title}</Text>
              <View
                style={tw`flex-row items-center px-3 py-1.5 rounded-full border ${getStatusColor(
                  order.status
                )} self-start`}
              >
                {getStatusIcon(order.status)}
                <Text style={tw`text-sm font-medium ml-1`}>{getStatusLabel(order.status)}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/orders/edit/${id}`)}
              style={tw`bg-gray-100 p-2 rounded-lg`}
            >
              <Edit size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {order.description && (
            <View style={tw`mb-4 pb-4 border-b border-gray-200`}>
              <Text style={tw`text-gray-700`}>{order.description}</Text>
            </View>
          )}

          <View style={tw`space-y-3`}>
            {order.amount && (
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}>
                  <DollarSign size={20} color="#16a34a" />
                </View>
                <View>
                  <Text style={tw`text-sm text-gray-600`}>Сума</Text>
                  <Text style={tw`text-lg font-semibold text-gray-900`}>
                    ₴{order.amount.toLocaleString()} {order.currency || 'UAH'}
                  </Text>
                </View>
              </View>
            )}

            <View style={tw`flex-row items-center mt-3`}>
              <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}>
                <Calendar size={20} color="#0284c7" />
              </View>
              <View>
                <Text style={tw`text-sm text-gray-600`}>Створено</Text>
                <Text style={tw`text-base font-medium text-gray-900`}>
                  {formatDate(order.created_at)}
                </Text>
              </View>
            </View>

            {client && (
              <TouchableOpacity
                onPress={() => router.push(`/clients/${client.id}`)}
                style={tw`flex-row items-center mt-3`}
              >
                <View style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}>
                  <User size={20} color="#8b5cf6" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm text-gray-600`}>Клієнт</Text>
                  <Text style={tw`text-base font-medium text-gray-900`}>{client.full_name}</Text>
                  {client.phone && (
                    <Text style={tw`text-sm text-gray-600`}>{client.phone}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>Змінити статус</Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {['pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => handleStatusChange(status)}
                style={tw`px-4 py-2 rounded-lg border ${
                  order.status === status
                    ? getStatusColor(status)
                    : 'bg-gray-100 border-gray-200'
                }`}
                disabled={order.status === status}
              >
                <Text
                  style={tw`text-sm font-medium ${
                    order.status === status ? '' : 'text-gray-700'
                  }`}
                >
                  {getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Button
          title="Редагувати замовлення"
          onPress={() => router.push(`/orders/edit/${id}`)}
          variant="secondary"
          fullWidth
        />
      </ScrollView>
    </View>
  );
}
