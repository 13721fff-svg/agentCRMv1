import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export default function MeetingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title="Зустрічі"
        showBack
        rightAction={
          <TouchableOpacity onPress={() => router.push('/meetings/create')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`flex-1 p-4`}>
        <EmptyState
          icon={<Calendar size={48} color="#a3a3a3" />}
          title="Немає зустрічей"
          description="Створіть першу зустріч для планування"
          action={
            <Button
              title="Створити зустріч"
              onPress={() => router.push('/meetings/create')}
            />
          }
        />
      </ScrollView>
    </View>
  );
}
