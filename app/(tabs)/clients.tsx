import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Users, MapPin, Phone, Mail, ChevronRight, Search } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { useClientsStore } from '@/store/clientsStore';
import { supabase } from '@/lib/supabase';

export default function ClientsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { clients, setClients } = useClientsStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header
          title={t('clients.title')}
          rightAction={
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity onPress={() => router.push('/map/clients')}>
                <MapPin size={24} color="#0284c7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/clients/create')}>
                <Plus size={24} color="#0284c7" />
              </TouchableOpacity>
            </View>
          }
        />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header
        title={t('clients.title')}
        rightAction={
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity onPress={() => router.push('/map/clients')}>
              <MapPin size={24} color="#0284c7" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/clients/create')}>
              <Plus size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>
        }
      />

      {clients.length === 0 ? (
        <ScrollView
          contentContainerStyle={tw`flex-1 p-4`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0284c7"
            />
          }
        >
          <EmptyState
            icon={<Users size={48} color="#9ca3af" />}
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
      ) : (
        <>
          <View style={tw`px-4 pt-4`}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Пошук клієнтів..."
              icon={<Search size={20} color="#6b7280" />}
            />
          </View>

          <ScrollView
            contentContainerStyle={tw`p-4`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#0284c7"
              />
            }
          >
            {filteredClients.length === 0 ? (
              <Card>
                <View style={tw`py-8 items-center`}>
                  <Search size={32} color="#9ca3af" />
                  <Text style={tw`text-gray-600 mt-2`}>Нічого не знайдено</Text>
                </View>
              </Card>
            ) : (
              filteredClients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  onPress={() => router.push(`/clients/${client.id}`)}
                  activeOpacity={0.7}
                >
                  <Card style={tw`mb-3`}>
                    <View style={tw`flex-row items-start`}>
                      <View
                        style={tw`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 items-center justify-center`}
                      >
                        <Text style={tw`text-xl font-bold text-white`}>
                          {client.full_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View style={tw`flex-1 ml-3`}>
                        <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                          {client.full_name}
                        </Text>

                        {client.company && (
                          <Text style={tw`text-sm text-gray-600 mb-1`}>
                            {client.company}
                          </Text>
                        )}

                        {client.phone && (
                          <View style={tw`flex-row items-center mb-1`}>
                            <Phone size={12} color="#6b7280" />
                            <Text style={tw`text-sm text-gray-600 ml-1`}>
                              {client.phone}
                            </Text>
                          </View>
                        )}

                        {client.email && (
                          <View style={tw`flex-row items-center`}>
                            <Mail size={12} color="#6b7280" />
                            <Text style={tw`text-sm text-gray-600 ml-1`}>
                              {client.email}
                            </Text>
                          </View>
                        )}
                      </View>

                      <ChevronRight size={20} color="#9ca3af" style={tw`ml-2`} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}
