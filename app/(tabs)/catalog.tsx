import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Search, Wrench, Home as HomeIcon, Car, Paintbrush, Scissors, Camera, Plus } from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useProvidersStore } from '@/store/providersStore';

const iconMap: Record<string, any> = {
  Wrench,
  Home: HomeIcon,
  Car,
  Paintbrush,
  Scissors,
  Camera,
};

export default function CatalogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useThemedStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, providers, fetchCategories, fetchProviders, loading } = useProvidersStore();

  useEffect(() => {
    fetchCategories();
    fetchProviders();
  }, []);

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title={t('catalog.title')}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/requests/create')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

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
              const Icon = iconMap[category.icon] || Wrench;
              return (
                <Card
                  key={category.id}
                  style={tw`w-[48%] m-1`}
                  onPress={() => router.push(`/catalog/${category.id}`)}
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
          {loading ? (
            <Card>
              <Text style={tw`text-neutral-600 text-center py-4`}>
                Завантаження...
              </Text>
            </Card>
          ) : providers.length === 0 ? (
            <Card>
              <Text style={tw`text-neutral-600 text-center py-4`}>
                Немає доступних виконавців
              </Text>
            </Card>
          ) : (
            providers.slice(0, 5).map((provider) => (
              <TouchableOpacity
                key={provider.id}
                onPress={() => router.push(`/profile/provider/${provider.id}`)}
              >
                <Card style={tw`mb-3`}>
                  <View style={tw`flex-row items-start justify-between`}>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-base font-semibold text-neutral-900 mb-1`}>
                        {provider.name}
                      </Text>
                      <Text style={tw`text-sm text-neutral-600 mb-2`} numberOfLines={2}>
                        {provider.description}
                      </Text>
                      <View style={tw`flex-row items-center`}>
                        <Text style={tw`text-sm text-amber-600 font-medium`}>
                          ★ {provider.rating.toFixed(1)}
                        </Text>
                        <Text style={tw`text-xs text-neutral-500 ml-2`}>
                          ({provider.reviews_count} {t('catalog.reviews')})
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
