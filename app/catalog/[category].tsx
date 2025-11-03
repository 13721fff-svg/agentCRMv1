import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Star, Phone, Mail } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import { useProvidersStore, Provider } from '@/store/providersStore';

export default function CategoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const { fetchProvidersByCategory, loading, categories } = useProvidersStore();

  const categoryData = categories.find(c => c.id === category);

  useEffect(() => {
    loadProviders();
  }, [category]);

  const loadProviders = async () => {
    if (category && typeof category === 'string') {
      const data = await fetchProvidersByCategory(category);
      setProviders(data);
    }
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title={categoryData?.name_uk || t('catalog.category')}
        showBack
      />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center bg-white border border-neutral-300 rounded-lg px-4 py-3`}>
            <Search size={20} color="#737373" />
            <TextInput
              style={tw`flex-1 ml-2 text-base text-neutral-900`}
              placeholder={t('catalog.searchProviders')}
              placeholderTextColor="#a3a3a3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {loading ? (
          <View style={tw`py-8`}>
            <ActivityIndicator size="large" color="#0284c7" />
          </View>
        ) : filteredProviders.length === 0 ? (
          <EmptyState
            icon="Store"
            title={t('catalog.noProviders')}
            description={t('catalog.noProvidersDescription')}
          />
        ) : (
          <View>
            {filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                style={tw`mb-4`}
                onPress={() => router.push(`/profile/provider/${provider.id}`)}
              >
                <View style={tw`p-4`}>
                  <View style={tw`flex-row justify-between items-start mb-2`}>
                    <Text style={tw`text-lg font-semibold text-neutral-900 flex-1`}>
                      {provider.name}
                    </Text>
                    <View style={tw`flex-row items-center`}>
                      <Star size={16} color="#f59e0b" fill="#f59e0b" />
                      <Text style={tw`ml-1 text-sm font-medium text-neutral-900`}>
                        {provider.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  <Text style={tw`text-sm text-neutral-600 mb-3`} numberOfLines={2}>
                    {provider.description}
                  </Text>

                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-row items-center`}>
                      <MapPin size={14} color="#737373" />
                      <Text style={tw`ml-1 text-xs text-neutral-600`}>
                        {provider.address || t('catalog.noAddress')}
                      </Text>
                    </View>
                    <Text style={tw`text-xs text-neutral-500`}>
                      {provider.reviews_count} {t('catalog.reviews')}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
