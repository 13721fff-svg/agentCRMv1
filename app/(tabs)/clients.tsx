import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Users } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export default function ClientsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title={t('clients.title')}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/clients/create')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`flex-1 p-4`}>
        <EmptyState
          icon={<Users size={48} color="#a3a3a3" />}
          title="Немає клієнтів"
          description="Додайте першого клієнта для початку роботи"
          action={
            <Button
              title={t('clients.addClient')}
              onPress={() => router.push('/clients/create')}
            />
          }
        />
      </ScrollView>
    </View>
  );
}
