import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Megaphone } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export default function CampaignsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title={t('campaigns.title')}
        showBack
        rightAction={
          <TouchableOpacity onPress={() => console.log('Create campaign')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`flex-1 p-4`}>
        <EmptyState
          icon={<Megaphone size={48} color="#a3a3a3" />}
          title="Немає кампаній"
          description="Створіть першу маркетингову кампанію"
          action={
            <Button
              title={t('campaigns.addCampaign')}
              onPress={() => console.log('Create campaign')}
            />
          }
        />
      </ScrollView>
    </View>
  );
}
