import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useClientsStore } from '@/store/clientsStore';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';

export default function EditClientScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { clients, updateClient } = useClientsStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const foundClient = clients.find((c) => c.id === id);

      if (foundClient) {
        setClient(foundClient);
        setFormData({
          full_name: foundClient.full_name,
          email: foundClient.email || '',
          phone: foundClient.phone || '',
          company: foundClient.company || '',
          address: foundClient.address || '',
          notes: foundClient.notes || '',
        });
      } else {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setClient(data);
        setFormData({
          full_name: data.full_name,
          email: data.email || '',
          phone: data.phone || '',
          company: data.company || '',
          address: data.address || '',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading client:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити клієнта');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Помилка', "Введіть ім'я клієнта");
      return;
    }

    try {
      setSaving(true);

      const updates: Partial<Client> = {
        full_name: formData.full_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      updateClient(id, updates);

      Alert.alert('Успіх', 'Клієнта оновлено', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating client:', error);
      Alert.alert('Помилка', 'Не вдалося оновити клієнта');
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={tw`text-lg text-gray-600`}>Клієнта не знайдено</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header title="Редагувати клієнта" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Основна інформація
          </Text>

          <Input
            label="Повне ім'я *"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            placeholder="Іван Іваненко"
          />

          <Input
            label="Телефон"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+380"
            keyboardType="phone-pad"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Компанія"
            value={formData.company}
            onChangeText={(text) => setFormData({ ...formData, company: text })}
            placeholder="ТОВ Компанія"
          />

          <Input
            label="Адреса"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="вул. Хрещатик, 1, Київ"
          />

          <Input
            label="Нотатки"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Додаткова інформація про клієнта"
            multiline
            numberOfLines={4}
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
