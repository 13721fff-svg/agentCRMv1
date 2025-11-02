import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ClientSelector from '@/components/ClientSelector';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus } from '@/types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'draft', label: 'Чернетка' },
  { value: 'pending', label: 'Очікує' },
  { value: 'confirmed', label: 'Підтверджено' },
  { value: 'in_progress', label: 'В роботі' },
  { value: 'completed', label: 'Завершено' },
  { value: 'cancelled', label: 'Скасовано' },
];

export default function EditOrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { orders, updateOrder } = useOrdersStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    status: 'draft' as OrderStatus,
    clientId: null as string | null,
    dueDate: '',
  });

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const foundOrder = orders.find((o) => o.id === id);

      if (foundOrder) {
        setOrder(foundOrder);
        setFormData({
          title: foundOrder.title,
          description: foundOrder.description || '',
          amount: foundOrder.amount?.toString() || '',
          status: foundOrder.status,
          clientId: foundOrder.client_id || null,
          dueDate: foundOrder.due_date
            ? new Date(foundOrder.due_date).toISOString().split('T')[0]
            : '',
        });
      } else {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
        setFormData({
          title: data.title,
          description: data.description || '',
          amount: data.amount?.toString() || '',
          status: data.status,
          clientId: data.client_id || null,
          dueDate: data.due_date
            ? new Date(data.due_date).toISOString().split('T')[0]
            : '',
        });
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити замовлення');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Помилка', 'Введіть назву замовлення');
      return;
    }

    try {
      setSaving(true);

      const updates: Partial<Order> = {
        title: formData.title,
        description: formData.description || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        status: formData.status,
        client_id: formData.clientId || undefined,
        due_date: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : undefined,
        updated_at: new Date().toISOString(),
      };

      if (formData.status === 'completed' && !order?.completed_at) {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase.from('orders').update(updates).eq('id', id);

      if (error) throw error;

      updateOrder(id, updates);

      Alert.alert('Успіх', 'Замовлення оновлено', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Помилка', 'Не вдалося оновити замовлення');
    } finally {
      setSaving(false);
    }
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
          <Text style={tw`text-lg text-gray-600`}>Замовлення не знайдено</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Редагувати замовлення" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Основна інформація
          </Text>

          <ClientSelector
            selectedClientId={formData.clientId}
            onClientChange={(id) => setFormData({ ...formData, clientId: id })}
          />

          <Input
            label="Назва *"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Встановлення вікон"
          />

          <Input
            label="Опис"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Детальний опис робіт"
            multiline
            numberOfLines={4}
          />

          <Input
            label="Сума"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            placeholder="5000"
            keyboardType="numeric"
          />

          <View style={tw`mb-3`}>
            <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Статус</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setFormData({ ...formData, status: option.value })}
                  style={tw`px-4 py-2 rounded-lg ${
                    formData.status === option.value
                      ? 'bg-blue-600'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text
                    style={tw`text-sm font-medium ${
                      formData.status === option.value ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Термін виконання"
            value={formData.dueDate}
            onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
            placeholder="YYYY-MM-DD"
          />
        </Card>

        <Button
          title="Зберегти зміни"
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}
