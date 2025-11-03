import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, Target } from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export default function KPIScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();

  const kpis = [];

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header
        title="KPI та Плани"
        showBack
        rightAction={
          <TouchableOpacity onPress={() => console.log('Add KPI')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`flex-1 p-4`}>
        {kpis.length === 0 ? (
          <EmptyState
            icon={<Target size={48} color="#a3a3a3" />}
            title="Немає KPI"
            description="Встановіть цілі та показники ефективності"
            action={
              <Button
                title="Створити KPI"
                onPress={() => console.log('Add KPI')}
              />
            }
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
