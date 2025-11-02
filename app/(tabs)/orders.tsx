import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title={t('orders.title')}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/orders/create')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`flex-1 p-4`}>
        <EmptyState
          icon={<Plus size={48} color="#a3a3a3" />}
          title="Немає замовлень"
          description="Створіть перше замовлення для початку роботи"
          action={
            <Button
              title={t('orders.addOrder')}
              onPress={() => router.push('/orders/create')}
            />
          }
        />
      </ScrollView>
    </View>
  );
}
