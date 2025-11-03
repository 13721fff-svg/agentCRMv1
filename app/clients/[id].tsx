import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Star,
  Edit,
  Trash2,
  ShoppingBag,
  Calendar,
  MessageSquare,
  ChevronRight,
} from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useClientsStore } from '@/store/clientsStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useMeetingsStore } from '@/store/meetingsStore';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';

export default function ClientDetailsScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { clients, deleteClient: deleteClientFromStore } = useClientsStore();
  const { orders } = useOrdersStore();
  const { meetings } = useMeetingsStore();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const foundClient = clients.find((c) => c.id === id);

      if (foundClient) {
        setClient(foundClient);
      } else {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setClient(data);
      }
    } catch (error) {
      console.error('Error loading client:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити клієнта');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/clients/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Видалити клієнта',
      `Ви впевнені, що хочете видалити ${client?.full_name}? Цю дію неможливо скасувати.`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('clients').delete().eq('id', id);
              if (error) throw error;

              deleteClientFromStore(id);
              Alert.alert('Успіх', 'Клієнта видалено', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('Error deleting client:', error);
              Alert.alert('Помилка', 'Не вдалося видалити клієнта');
            }
          },
        },
      ]
    );
  };

  const handleCreateOrder = () => {
    router.push({
      pathname: '/orders/create',
      params: { clientId: id, clientName: client?.full_name },
    });
  };

  const handleCall = () => {
    if (client?.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  const handleShowOnMap = () => {
    if (client?.latitude && client?.longitude) {
      router.push({
        pathname: '/map/picker',
        params: {
          latitude: client.latitude,
          longitude: client.longitude,
          title: client.full_name,
        },
      });
    }
  };

  const clientOrders = orders.filter((o) => o.client_id === id);
  const clientMeetings = meetings.filter((m) => m.client_id === id);

  if (loading) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title="Завантаження..." showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title="Помилка" showBack />
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <User size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 mt-4`}>Клієнта не знайдено</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header
        title="Деталі клієнта"
        showBack
        rightAction={
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity onPress={handleEdit}>
              <Edit size={20} color="#0284c7" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`items-center mb-4`}>
            <View
              style={tw`w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 items-center justify-center mb-3`}
            >
              <Text style={tw`text-3xl font-bold text-white`}>
                {client.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={tw`text-2xl font-bold text-gray-900 text-center`}>
              {client.full_name}
            </Text>
            {client.company && (
              <Text style={tw`text-base text-gray-600 text-center mt-1`}>
                {client.company}
              </Text>
            )}
            {client.rating !== undefined && (
              <View style={tw`flex-row items-center mt-2`}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <Text style={tw`text-sm font-medium text-gray-700 ml-1`}>
                  {client.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          <View style={tw`border-t border-gray-200 pt-4 space-y-3`}>
            {client.phone && (
              <TouchableOpacity
                onPress={handleCall}
                style={tw`flex-row items-center p-3 bg-blue-50 rounded-lg`}
              >
                <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center`}>
                  <Phone size={20} color="#0284c7" />
                </View>
                <View style={tw`flex-1 ml-3`}>
                  <Text style={tw`text-xs text-gray-600 mb-1`}>Телефон</Text>
                  <Text style={tw`text-base font-medium text-blue-700`}>{client.phone}</Text>
                </View>
                <ChevronRight size={20} color="#0284c7" />
              </TouchableOpacity>
            )}

            {client.email && (
              <TouchableOpacity
                onPress={handleEmail}
                style={tw`flex-row items-center p-3 bg-purple-50 rounded-lg`}
              >
                <View style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center`}>
                  <Mail size={20} color="#8b5cf6" />
                </View>
                <View style={tw`flex-1 ml-3`}>
                  <Text style={tw`text-xs text-gray-600 mb-1`}>Email</Text>
                  <Text style={tw`text-base font-medium text-purple-700`}>{client.email}</Text>
                </View>
                <ChevronRight size={20} color="#8b5cf6" />
              </TouchableOpacity>
            )}

            {client.address && (
              <TouchableOpacity
                onPress={client.latitude && client.longitude ? handleShowOnMap : undefined}
                style={tw`flex-row items-center p-3 bg-green-50 rounded-lg`}
              >
                <View style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center`}>
                  <MapPin size={20} color="#16a34a" />
                </View>
                <View style={tw`flex-1 ml-3`}>
                  <Text style={tw`text-xs text-gray-600 mb-1`}>Адреса</Text>
                  <Text style={tw`text-base font-medium text-green-700`}>
                    {client.address}
                  </Text>
                </View>
                {client.latitude && client.longitude && (
                  <ChevronRight size={20} color="#16a34a" />
                )}
              </TouchableOpacity>
            )}
          </View>

          {client.notes && (
            <View style={tw`border-t border-gray-200 pt-4 mt-4`}>
              <View style={tw`flex-row items-center mb-2`}>
                <MessageSquare size={16} color="#6b7280" />
                <Text style={tw`text-sm font-medium text-gray-700 ml-2`}>Нотатки</Text>
              </View>
              <Text style={tw`text-sm text-gray-600`}>{client.notes}</Text>
            </View>
          )}

          {client.tags && client.tags.length > 0 && (
            <View style={tw`border-t border-gray-200 pt-4 mt-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Теги</Text>
              <View style={tw`flex-row flex-wrap gap-2`}>
                {client.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={tw`px-3 py-1 bg-blue-100 rounded-full`}
                  >
                    <Text style={tw`text-xs font-medium text-blue-700`}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <Text style={tw`text-lg font-semibold text-gray-900`}>Статистика</Text>
          </View>

          <View style={tw`flex-row gap-2`}>
            <View style={tw`flex-1 bg-blue-50 rounded-lg p-3`}>
              <View style={tw`flex-row items-center mb-1`}>
                <ShoppingBag size={16} color="#0284c7" />
                <Text style={tw`text-xs text-blue-700 ml-1`}>Замовлень</Text>
              </View>
              <Text style={tw`text-2xl font-bold text-blue-900`}>
                {clientOrders.length}
              </Text>
            </View>

            <View style={tw`flex-1 bg-purple-50 rounded-lg p-3`}>
              <View style={tw`flex-row items-center mb-1`}>
                <Calendar size={16} color="#8b5cf6" />
                <Text style={tw`text-xs text-purple-700 ml-1`}>Зустрічей</Text>
              </View>
              <Text style={tw`text-2xl font-bold text-purple-900`}>
                {clientMeetings.length}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          title="Створити замовлення"
          onPress={handleCreateOrder}
          fullWidth
          style={tw`mb-4`}
        />

        {clientOrders.length > 0 && (
          <Card style={tw`mb-4`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Останні замовлення
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text style={tw`text-sm font-medium text-blue-600`}>Всі</Text>
              </TouchableOpacity>
            </View>

            {clientOrders.slice(0, 3).map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/orders/${order.id}`)}
                style={tw`flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0`}
              >
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-gray-900`} numberOfLines={1}>
                    {order.title}
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>
                    {new Date(order.created_at).toLocaleDateString('uk-UA')}
                  </Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  {order.amount && (
                    <Text style={tw`text-base font-semibold text-gray-900 mr-2`}>
                      ₴{order.amount}
                    </Text>
                  )}
                  <ChevronRight size={16} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {clientMeetings.length > 0 && (
          <Card style={tw`mb-4`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Останні зустрічі
              </Text>
              <TouchableOpacity onPress={() => router.push('/meetings')}>
                <Text style={tw`text-sm font-medium text-blue-600`}>Всі</Text>
              </TouchableOpacity>
            </View>

            {clientMeetings.slice(0, 3).map((meeting) => (
              <TouchableOpacity
                key={meeting.id}
                onPress={() => router.push(`/meetings/${meeting.id}`)}
                style={tw`flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0`}
              >
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-gray-900`} numberOfLines={1}>
                    {meeting.title}
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>
                    {new Date(meeting.start_time).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <ChevronRight size={16} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </Card>
        )}

        <View style={tw`text-center mb-4`}>
          <Text style={tw`text-xs text-gray-500`}>
            Створено: {new Date(client.created_at).toLocaleDateString('uk-UA')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
