import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Star, Phone, Mail, MapPin, MessageSquare, FileText } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useProvidersStore, Provider } from '@/store/providersStore';

export default function ProviderProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const { fetchProviderById, loading } = useProvidersStore();

  useEffect(() => {
    loadProvider();
  }, [id]);

  const loadProvider = async () => {
    if (id && typeof id === 'string') {
      const data = await fetchProviderById(id);
      setProvider(data);
    }
  };

  const handleCall = () => {
    if (provider?.phone) {
      Linking.openURL(`tel:${provider.phone}`);
    }
  };

  const handleEmail = () => {
    if (provider?.email) {
      Linking.openURL(`mailto:${provider.email}`);
    }
  };

  const handleCreateRequest = () => {
    router.push({
      pathname: '/requests/create',
      params: { providerId: id, providerName: provider?.name }
    });
  };

  if (loading || !provider) {
    return (
      <View style={tw`flex-1 bg-neutral-50`}>
        <Header title={t('profile.provider')} showBack />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header title={provider.name} showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`p-6 items-center`}>
            <View style={tw`w-20 h-20 rounded-full bg-sky-100 items-center justify-center mb-4`}>
              <Text style={tw`text-3xl font-bold text-sky-600`}>
                {provider.name.charAt(0)}
              </Text>
            </View>

            <Text style={tw`text-2xl font-bold text-neutral-900 mb-2 text-center`}>
              {provider.name}
            </Text>

            <View style={tw`flex-row items-center mb-4`}>
              <Star size={20} color="#f59e0b" fill="#f59e0b" />
              <Text style={tw`ml-2 text-lg font-semibold text-neutral-900`}>
                {provider.rating.toFixed(1)}
              </Text>
              <Text style={tw`ml-2 text-sm text-neutral-600`}>
                ({provider.reviews_count} {t('catalog.reviews')})
              </Text>
            </View>

            <Text style={tw`text-base text-neutral-700 text-center mb-6`}>
              {provider.description}
            </Text>

            <View style={tw`w-full`}>
              {provider.phone && (
                <TouchableOpacity
                  style={tw`flex-row items-center py-3 border-t border-neutral-200`}
                  onPress={handleCall}
                >
                  <Phone size={20} color="#0284c7" />
                  <Text style={tw`ml-3 text-base text-neutral-900`}>{provider.phone}</Text>
                </TouchableOpacity>
              )}

              {provider.email && (
                <TouchableOpacity
                  style={tw`flex-row items-center py-3 border-t border-neutral-200`}
                  onPress={handleEmail}
                >
                  <Mail size={20} color="#0284c7" />
                  <Text style={tw`ml-3 text-base text-neutral-900`}>{provider.email}</Text>
                </TouchableOpacity>
              )}

              {provider.address && (
                <View style={tw`flex-row items-center py-3 border-t border-neutral-200`}>
                  <MapPin size={20} color="#0284c7" />
                  <Text style={tw`ml-3 text-base text-neutral-900 flex-1`}>
                    {provider.address}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        <View style={tw`mb-4`}>
          <Button
            title={t('catalog.createRequest')}
            onPress={handleCreateRequest}
            leftIcon={<FileText size={20} color="#fff" />}
          />
        </View>

        <View style={tw`flex-row gap-2 mb-4`}>
          <View style={tw`flex-1`}>
            <Button
              title={t('catalog.viewReviews')}
              variant="outline"
              onPress={() => router.push(`/reviews/${id}`)}
              leftIcon={<Star size={20} color="#0284c7" />}
            />
          </View>
          <View style={tw`flex-1`}>
            <Button
              title={t('catalog.message')}
              variant="outline"
              onPress={() => router.push(`/chat/${id}`)}
              leftIcon={<MessageSquare size={20} color="#0284c7" />}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
