import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, Wrench, Home as HomeIcon, Car, Paintbrush, Scissors, Camera } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';

const categories = [
  { id: '1', name: 'Ремонт', name_uk: 'Ремонт', icon: Wrench, color: '#0ea5e9' },
  { id: '2', name: 'Будівництво', name_uk: 'Будівництво', icon: HomeIcon, color: '#22c55e' },
  { id: '3', name: 'Авто', name_uk: 'Авто', icon: Car, color: '#f59e0b' },
  { id: '4', name: 'Краса', name_uk: 'Краса', icon: Scissors, color: '#ef4444' },
  { id: '5', name: 'Дизайн', name_uk: 'Дизайн', icon: Paintbrush, color: '#8b5cf6' },
  { id: '6', name: 'Фото', name_uk: 'Фото', icon: Camera, color: '#06b6d4' },
];

export default function CatalogScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header title={t('catalog.title')} />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center bg-white border border-neutral-300 rounded-lg px-4 py-3`}>
            <Search size={20} color="#737373" />
            <TextInput
              style={tw`flex-1 ml-2 text-base text-neutral-900`}
              placeholder={t('catalog.searchServices')}
              placeholderTextColor="#a3a3a3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-semibold text-neutral-900 mb-3`}>
            {t('catalog.categories')}
          </Text>
          <View style={tw`flex-row flex-wrap`}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  style={tw`w-[48%] m-1`}
                  onPress={() => console.log('Category:', category.name_uk)}
                >
                  <View style={tw`items-center py-4`}>
                    <View
                      style={tw.style(
                        'w-12 h-12 rounded-full items-center justify-center mb-2',
                        { backgroundColor: category.color + '20' }
                      )}
                    >
                      <Icon size={24} color={category.color} />
                    </View>
                    <Text style={tw`text-sm font-medium text-neutral-900`}>
                      {category.name_uk}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={tw`text-lg font-semibold text-neutral-900 mb-3`}>
            {t('catalog.providers')}
          </Text>
          <Card>
            <Text style={tw`text-neutral-600 text-center py-4`}>
              Немає доступних виконавців
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
