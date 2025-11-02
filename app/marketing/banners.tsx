import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import EmptyState from '@/components/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useMarketingStore } from '@/store/marketingStore';
import { supabase } from '@/lib/supabase';

interface Banner {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
  is_active: boolean;
  views: number;
  clicks: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export default function BannersScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { setBanners } = useMarketingStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBannersLocal] = useState<Banner[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    link: '',
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBannersLocal(data || []);
      setBanners(data?.filter((b) => b.is_active) || []);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBanners();
    setRefreshing(false);
  };

  const handleCreateBanner = async () => {
    if (!newBanner.title.trim()) {
      Alert.alert('Помилка', 'Введіть назву банера');
      return;
    }

    if (!user?.org_id) return;

    try {
      setSaving(true);

      const bannerData = {
        org_id: user.org_id,
        title: newBanner.title,
        description: newBanner.description || null,
        link: newBanner.link || null,
        is_active: true,
        views: 0,
        clicks: 0,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data, error } = await supabase
        .from('banners')
        .insert([bannerData])
        .select()
        .single();

      if (error) throw error;

      setBannersLocal([data, ...banners]);
      setShowCreateForm(false);
      setNewBanner({ title: '', description: '', link: '' });
      Alert.alert('Успіх', 'Банер створено');
    } catch (error) {
      console.error('Error creating banner:', error);
      Alert.alert('Помилка', 'Не вдалося створити банер');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (bannerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: isActive })
        .eq('id', bannerId);

      if (error) throw error;

      setBannersLocal(
        banners.map((b) => (b.id === bannerId ? { ...b, is_active: isActive } : b))
      );
    } catch (error) {
      console.error('Error toggling banner:', error);
      Alert.alert('Помилка', 'Не вдалося змінити статус банера');
    }
  };

  const handleDeleteBanner = (bannerId: string) => {
    Alert.alert('Видалити банер', 'Ви впевнені?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('banners').delete().eq('id', bannerId);
            if (error) throw error;

            setBannersLocal(banners.filter((b) => b.id !== bannerId));
            Alert.alert('Успіх', 'Банер видалено');
          } catch (error) {
            console.error('Error deleting banner:', error);
            Alert.alert('Помилка', 'Не вдалося видалити банер');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="Банери та акції" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header
        title="Банери та акції"
        showBack
        rightAction={
          <TouchableOpacity onPress={() => setShowCreateForm(!showCreateForm)}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

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
        {showCreateForm && (
          <Card style={tw`mb-4`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
              Створити банер
            </Text>

            <Input
              label="Назва *"
              value={newBanner.title}
              onChangeText={(text) => setNewBanner({ ...newBanner, title: text })}
              placeholder="Наприклад, Літня знижка 20%"
            />

            <Input
              label="Опис"
              value={newBanner.description}
              onChangeText={(text) => setNewBanner({ ...newBanner, description: text })}
              placeholder="Додаткова інформація про акцію"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Посилання"
              value={newBanner.link}
              onChangeText={(text) => setNewBanner({ ...newBanner, link: text })}
              placeholder="https://..."
            />

            <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3`}>
              <Text style={tw`text-xs text-blue-800`}>
                📍 Банер буде показано у топі сторінки Marketing Hub протягом 30 днів
              </Text>
            </View>

            <View style={tw`flex-row gap-2`}>
              <Button
                title="Створити"
                onPress={handleCreateBanner}
                loading={saving}
                style={tw`flex-1`}
              />
              <Button
                title="Скасувати"
                onPress={() => {
                  setShowCreateForm(false);
                  setNewBanner({ title: '', description: '', link: '' });
                }}
                variant="secondary"
                style={tw`flex-1`}
              />
            </View>
          </Card>
        )}

        {banners.length === 0 ? (
          <EmptyState
            icon={<ImageIcon size={48} color="#9ca3af" />}
            title="Немає банерів"
            description="Створіть перший банер для просування вашої акції"
            action={
              <Button
                title="Створити банер"
                onPress={() => setShowCreateForm(true)}
              />
            }
          />
        ) : (
          <>
            <View style={tw`mb-3`}>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Мої банери ({banners.length})
              </Text>
            </View>

            {banners.map((banner) => (
              <Card key={banner.id} style={tw`mb-3`}>
                <View style={tw`flex-row items-start justify-between mb-3`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-lg font-semibold text-gray-900 mb-1`}>
                      {banner.title}
                    </Text>
                    {banner.description && (
                      <Text style={tw`text-sm text-gray-600 mb-2`}>
                        {banner.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteBanner(banner.id)}>
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-row gap-2 mb-3`}>
                  <View style={tw`flex-1 bg-blue-50 rounded-lg p-3`}>
                    <View style={tw`flex-row items-center mb-1`}>
                      <Eye size={14} color="#0284c7" />
                      <Text style={tw`text-xs text-blue-700 ml-1`}>Перегляди</Text>
                    </View>
                    <Text style={tw`text-xl font-bold text-blue-900`}>
                      {banner.views || 0}
                    </Text>
                  </View>
                  <View style={tw`flex-1 bg-green-50 rounded-lg p-3`}>
                    <View style={tw`flex-row items-center mb-1`}>
                      <TrendingUp size={14} color="#16a34a" />
                      <Text style={tw`text-xs text-green-700 ml-1`}>Кліки</Text>
                    </View>
                    <Text style={tw`text-xl font-bold text-green-900`}>
                      {banner.clicks || 0}
                    </Text>
                  </View>
                </View>

                <View style={tw`flex-row items-center justify-between pt-3 border-t border-gray-200`}>
                  <View>
                    <View style={tw`flex-row items-center mb-1`}>
                      <Calendar size={14} color="#6b7280" />
                      <Text style={tw`text-xs text-gray-600 ml-1`}>
                        {formatDate(banner.start_date)} - {formatDate(banner.end_date)}
                      </Text>
                    </View>
                  </View>

                  <View style={tw`flex-row items-center`}>
                    {banner.is_active ? (
                      <Eye size={16} color="#16a34a" />
                    ) : (
                      <EyeOff size={16} color="#6b7280" />
                    )}
                    <Switch
                      value={banner.is_active}
                      onValueChange={(value) => handleToggleActive(banner.id, value)}
                      trackColor={{ false: '#d1d5db', true: '#86efac' }}
                      thumbColor={banner.is_active ? '#16a34a' : '#9ca3af'}
                      style={tw`ml-2`}
                    />
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

        <Card style={tw`bg-purple-50 border-purple-200 mt-4`}>
          <View style={tw`flex-row items-start`}>
            <View style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center`}>
              <TrendingUp size={20} color="#8b5cf6" />
            </View>
            <View style={tw`flex-1 ml-3`}>
              <Text style={tw`text-base font-semibold text-purple-900 mb-1`}>
                Підвищуйте ефективність
              </Text>
              <Text style={tw`text-sm text-purple-800`}>
                Банери у топі списку отримують до 10x більше переглядів та кліків
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
