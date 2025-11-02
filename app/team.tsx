import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, User, Mail } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export default function TeamScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const members = [];

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title={t('team.title')}
        showBack
        rightAction={
          <TouchableOpacity onPress={() => console.log('Add member')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`flex-1 p-4`}>
        {members.length === 0 ? (
          <EmptyState
            icon={<User size={48} color="#a3a3a3" />}
            title="Немає членів команди"
            description="Додайте членів команди для спільної роботи"
            action={
              <Button
                title={t('team.addMember')}
                onPress={() => console.log('Add member')}
              />
            }
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
