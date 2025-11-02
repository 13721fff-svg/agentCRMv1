import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  Megaphone,
  Mail,
  MessageSquare,
  Image as ImageIcon,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useCampaignsStore } from '@/store/campaignsStore';
import { supabase } from '@/lib/supabase';
import { Campaign } from '@/types';

export default function CampaignsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { campaigns, setCampaigns } = useCampaignsStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail size={20} color="#0284c7" />;
      case 'sms':
        return <MessageSquare size={20} color="#16a34a" />;
      case 'banner':
        return <ImageIcon size={20} color="#f59e0b" />;
      default:
        return <Megaphone size={20} color="#8b5cf6" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle size={16} color="#16a34a" />;
      case 'completed':
        return <CheckCircle size={16} color="#6b7280" />;
      case 'scheduled':
        return <Clock size={16} color="#0284c7" />;
      case 'cancelled':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'completed':
        return 'Завершена';
      case 'scheduled':
        return 'Заплановано';
      case 'cancelled':
        return 'Скасовано';
      default:
        return 'Чернетка';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'banner':
        return 'Банер';
      default:
        return 'Push';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const matchesSearch = campaign.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header
          title="Кампанії"
          showBack
          rightAction={
            <TouchableOpacity onPress={() => router.push('/campaigns/new')}>
              <Plus size={24} color="#0284c7" />
            </TouchableOpacity>
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
        title="Кампанії"
        showBack
        rightAction={
          <TouchableOpacity onPress={() => router.push('/campaigns/new')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      {campaigns.length === 0 ? (
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
            icon={<Megaphone size={48} color="#9ca3af" />}
            title="Немає кампаній"
            description="Створіть першу маркетингову кампанію для залучення клієнтів"
            action={
              <Button
                title="Створити кампанію"
                onPress={() => router.push('/campaigns/new')}
              />
            }
          />
        </ScrollView>
      ) : (
        <>
          <View style={tw`px-4 pt-4 pb-2`}>
            <View style={tw`flex-row items-center bg-white rounded-lg px-3 py-2 mb-3`}>
              <Search size={20} color="#6b7280" />
              <TextInput
                style={tw`flex-1 ml-2 text-base text-gray-900`}
                placeholder="Пошук кампаній..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={tw`flex-row gap-2 mb-3`}>
              {[
                { id: 'all', label: 'Всі', count: stats.total },
                { id: 'active', label: 'Активні', count: stats.active },
                { id: 'scheduled', label: 'Заплановані', count: stats.scheduled },
                { id: 'completed', label: 'Завершені', count: stats.completed },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  onPress={() => setStatusFilter(filter.id)}
                  style={tw`px-3 py-2 rounded-lg ${
                    statusFilter === filter.id
                      ? 'bg-blue-600'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text
                    style={tw`text-xs font-medium ${
                      statusFilter === filter.id ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={tw`p-4 pt-2`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#0284c7"
              />
            }
          >
            {filteredCampaigns.length === 0 ? (
              <Card>
                <View style={tw`py-8 items-center`}>
                  <Search size={32} color="#9ca3af" />
                  <Text style={tw`text-gray-600 mt-2`}>
                    Кампанії не знайдено
                  </Text>
                </View>
              </Card>
            ) : (
              filteredCampaigns.map((campaign) => (
                <TouchableOpacity
                  key={campaign.id}
                  onPress={() => router.push(`/campaigns/${campaign.id}`)}
                  activeOpacity={0.7}
                >
                  <Card style={tw`mb-3`}>
                    <View style={tw`flex-row items-start justify-between mb-3`}>
                      <View style={tw`flex-1`}>
                        <View style={tw`flex-row items-center mb-2`}>
                          <View
                            style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}
                          >
                            {getTypeIcon(campaign.type)}
                          </View>
                          <View style={tw`flex-1`}>
                            <Text
                              style={tw`text-base font-semibold text-gray-900`}
                              numberOfLines={1}
                            >
                              {campaign.title}
                            </Text>
                            <Text style={tw`text-xs text-gray-600`}>
                              {getTypeLabel(campaign.type)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={tw`flex-row items-center px-2 py-1 rounded-full ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {getStatusIcon(campaign.status)}
                        <Text style={tw`text-xs font-medium ml-1`}>
                          {getStatusLabel(campaign.status)}
                        </Text>
                      </View>
                    </View>

                    {campaign.description && (
                      <Text
                        style={tw`text-sm text-gray-600 mb-3`}
                        numberOfLines={2}
                      >
                        {campaign.description}
                      </Text>
                    )}

                    <View style={tw`flex-row items-center justify-between`}>
                      <View style={tw`flex-row items-center gap-4`}>
                        {campaign.target_audience && (
                          <View style={tw`flex-row items-center`}>
                            <Users size={14} color="#6b7280" />
                            <Text style={tw`text-xs text-gray-600 ml-1`}>
                              {typeof campaign.target_audience === 'object' &&
                              campaign.target_audience !== null
                                ? (campaign.target_audience as any).count || 'Всі'
                                : 'Всі'}
                            </Text>
                          </View>
                        )}
                        {campaign.metrics && (
                          <View style={tw`flex-row items-center`}>
                            <TrendingUp size={14} color="#6b7280" />
                            <Text style={tw`text-xs text-gray-600 ml-1`}>
                              {typeof campaign.metrics === 'object' &&
                              campaign.metrics !== null
                                ? (campaign.metrics as any).views || '0'
                                : '0'}{' '}
                              переглядів
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={tw`text-xs text-gray-500`}>
                        {formatDate(campaign.start_date || campaign.created_at)}
                      </Text>
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
