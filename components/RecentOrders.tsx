import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react-native';
import tw from '@/lib/tw';
import Card from './Card';
import { Order } from '@/types';

interface RecentOrdersProps {
  orders: Order[];
  loading?: boolean;
  limit?: number;
}

export default function RecentOrders({ orders, loading = false, limit = 5 }: RecentOrdersProps) {
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#16a34a" />;
      case 'cancelled':
        return <XCircle size={16} color="#ef4444" />;
      case 'in_progress':
        return <Clock size={16} color="#0284c7" />;
      default:
        return <AlertCircle size={16} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
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
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
    });
  };

  const displayOrders = orders.slice(0, limit);

  if (loading) {
    return (
      <Card>
        <View style={tw`py-8 items-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </Card>
    );
  }

  if (displayOrders.length === 0) {
    return (
      <Card>
        <View style={tw`py-8 items-center`}>
          <Package size={32} color="#9ca3af" />
          <Text style={tw`text-gray-600 mt-2`}>Немає останніх замовлень</Text>
          <TouchableOpacity
            onPress={() => router.push('/orders/create')}
            style={tw`mt-3 bg-blue-50 px-4 py-2 rounded-lg`}
          >
            <Text style={tw`text-blue-700 font-medium text-sm`}>Створити замовлення</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      {displayOrders.map((order, index) => (
        <TouchableOpacity
          key={order.id}
          onPress={() => router.push(`/orders/${order.id}`)}
          style={tw`${index > 0 ? 'border-t border-gray-100 pt-3' : ''} ${
            index < displayOrders.length - 1 ? 'pb-3' : ''
          }`}
          activeOpacity={0.7}
        >
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-semibold text-gray-900 mb-1`} numberOfLines={1}>
                {order.title}
              </Text>
              <View style={tw`flex-row items-center`}>
                <Clock size={12} color="#6b7280" />
                <Text style={tw`text-xs text-gray-600 ml-1`}>
                  {formatDate(order.created_at)}
                </Text>
                {order.amount && (
                  <>
                    <Text style={tw`text-xs text-gray-400 mx-1`}>•</Text>
                    <Text style={tw`text-xs text-gray-900 font-medium`}>
                      ₴{order.amount.toLocaleString()}
                    </Text>
                  </>
                )}
              </View>
            </View>
            <View style={tw`flex-row items-center ml-2`}>
              <View
                style={tw`flex-row items-center px-2 py-1 rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                <Text style={tw`text-xs font-medium ml-1`}>{getStatusLabel(order.status)}</Text>
              </View>
              <ChevronRight size={16} color="#9ca3af" style={tw`ml-1`} />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {orders.length > limit && (
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/orders')}
          style={tw`mt-3 pt-3 border-t border-gray-100`}
        >
          <Text style={tw`text-blue-700 font-medium text-sm text-center`}>
            Переглянути всі ({orders.length})
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}
