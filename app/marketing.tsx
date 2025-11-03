import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  Star,
  Award,
  Eye,
  Zap,
  Image as ImageIcon,
  Search,
  Filter,
} from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useMarketingStore } from '@/store/marketingStore';
import { supabase } from '@/lib/supabase';

export default function MarketingHubScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const user = useAuthStore((state) => state.user);
  const { profiles, banners, setProfiles, setBanners, promoteProfile } =
    useMarketingStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'promoted' | 'regular'>('all');

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);

      const [profilesData, bannersData] = await Promise.all([
        supabase
          .from('users')
          .select('id, full_name, rating, avatar_url')
          .eq('role', 'individual')
          .order('rating', { ascending: false })
          .limit(20),
        supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .limit(5),
      ]);

      if (profilesData.data) {
        const mappedProfiles = profilesData.data.map((p, index) => ({
          id: p.id,
          user_id: p.id,
          full_name: p.full_name,
          rating: p.rating || 0,
          is_promoted: index < 3,
          badge: index === 0 ? 'TOP' : index < 3 ? 'PRO' : undefined,
          created_at: new Date().toISOString(),
        }));
        setProfiles(mappedProfiles);
      }

      if (bannersData.data) {
        setBanners(bannersData.data);
      }
    } catch (error) {
      console.error('Error loading marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMarketingData();
    setRefreshing(false);
  };

  const handlePromoteProfile = async (profileId: string) => {
    Alert.alert(
      'Підняти профіль',
      'Ваш профіль буде показаний у топі списку виконавців протягом 7 днів. Вартість: 500 грн',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Підняти',
          onPress: async () => {
            try {
              promoteProfile(profileId);
              Alert.alert(
                'Успіх',
                'Ваш профіль підняно! Він буде показаний у топі протягом 7 днів'
              );
            } catch (error) {
              console.error('Error promoting profile:', error);
              Alert.alert('Помилка', 'Не вдалося підняти профіль');
            }
          },
        },
      ]
    );
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (filter === 'all') return true;
    if (filter === 'promoted') return profile.is_promoted;
    return !profile.is_promoted;
  });

  const stats = {
    all: profiles.length,
    promoted: profiles.filter((p) => p.is_promoted).length,
    regular: profiles.filter((p) => !p.is_promoted).length,
  };

  if (loading) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title="Marketing Hub" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header title="Marketing Hub" showBack />

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
        {banners.length > 0 && (
          <Card style={tw`mb-4 p-0 overflow-hidden`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {banners.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  style={tw`w-80 h-40 bg-gradient-to-r from-purple-500 to-blue-500 justify-center items-center px-6`}
                >
                  <ImageIcon size={48} color="#fff" style={tw`mb-3`} />
                  <Text style={tw`text-xl font-bold text-white text-center`}>
                    {banner.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <Text style={tw`text-lg font-semibold text-gray-900`}>
              Підняти свій профіль
            </Text>
            <TrendingUp size={24} color="#8b5cf6" />
          </View>
          <Text style={tw`text-sm text-gray-600 mb-3`}>
            Збільште видимість вашого профілю та отримайте більше замовлень
          </Text>
          <View style={tw`flex-row items-center gap-3 mb-3`}>
            <View style={tw`flex-1 bg-purple-50 rounded-lg p-3`}>
              <View style={tw`flex-row items-center mb-1`}>
                <Eye size={16} color="#8b5cf6" />
                <Text style={tw`text-xs text-purple-700 ml-1`}>Перегляди</Text>
              </View>
              <Text style={tw`text-2xl font-bold text-purple-900`}>+300%</Text>
            </View>
            <View style={tw`flex-1 bg-blue-50 rounded-lg p-3`}>
              <View style={tw`flex-row items-center mb-1`}>
                <Zap size={16} color="#0284c7" />
                <Text style={tw`text-xs text-blue-700 ml-1`}>Замовлення</Text>
              </View>
              <Text style={tw`text-2xl font-bold text-blue-900`}>+150%</Text>
            </View>
          </View>
          <Button
            title="Підняти профіль (500 грн)"
            onPress={() => handlePromoteProfile(user?.id || '')}
            fullWidth
          />
        </Card>

        <View style={tw`flex-row items-center justify-between mb-3`}>
          <Text style={tw`text-lg font-semibold text-gray-900`}>Виконавці</Text>
          <View style={tw`flex-row gap-2`}>
            {[
              { id: 'all', label: 'Всі', count: stats.all },
              { id: 'promoted', label: 'TOP', count: stats.promoted },
              { id: 'regular', label: 'Звичайні', count: stats.regular },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id as any)}
                style={tw`px-3 py-1.5 rounded-lg ${
                  filter === f.id ? 'bg-blue-600' : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  style={tw`text-xs font-medium ${
                    filter === f.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {f.label} ({f.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredProfiles.map((profile, index) => (
          <Card key={profile.id} style={tw`mb-3 ${profile.is_promoted ? 'border-2 border-purple-300 bg-purple-50' : ''}`}>
            <View style={tw`flex-row items-start`}>
              <View style={tw`relative`}>
                <View
                  style={tw`w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 items-center justify-center`}
                >
                  <Text style={tw`text-2xl font-bold text-white`}>
                    {profile.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                {profile.badge && (
                  <View
                    style={tw`absolute -top-1 -right-1 bg-yellow-400 px-2 py-0.5 rounded-full`}
                  >
                    <Text style={tw`text-xs font-bold text-yellow-900`}>
                      {profile.badge}
                    </Text>
                  </View>
                )}
              </View>

              <View style={tw`flex-1 ml-3`}>
                <View style={tw`flex-row items-center justify-between mb-1`}>
                  <Text style={tw`text-base font-semibold text-gray-900`}>
                    {profile.full_name}
                  </Text>
                  {profile.is_promoted && (
                    <View style={tw`flex-row items-center px-2 py-1 bg-purple-100 rounded-full`}>
                      <Zap size={12} color="#8b5cf6" fill="#8b5cf6" />
                      <Text style={tw`text-xs font-semibold text-purple-700 ml-1`}>
                        TOP
                      </Text>
                    </View>
                  )}
                </View>

                <View style={tw`flex-row items-center mb-2`}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text style={tw`text-sm font-medium text-gray-700 ml-1`}>
                    {profile.rating.toFixed(1)}
                  </Text>
                  <Text style={tw`text-xs text-gray-500 ml-2`}>
                    Позиція #{index + 1}
                  </Text>
                </View>

                {profile.is_promoted && (
                  <View style={tw`bg-purple-100 border border-purple-200 rounded-lg p-2`}>
                    <View style={tw`flex-row items-center`}>
                      <TrendingUp size={14} color="#8b5cf6" />
                      <Text style={tw`text-xs text-purple-800 ml-1`}>
                        Підвищена видимість до {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('uk-UA')}
                      </Text>
                    </View>
                  </View>
                )}

                {!profile.is_promoted && profile.user_id === user?.id && (
                  <Button
                    title="Підняти профіль"
                    onPress={() => handlePromoteProfile(profile.id)}
                    variant="secondary"
                    style={tw`mt-2`}
                  />
                )}
              </View>
            </View>
          </Card>
        ))}

        <Card style={tw`mb-4 bg-blue-50 border-blue-200`}>
          <View style={tw`flex-row items-start`}>
            <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center`}>
              <Award size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1 ml-3`}>
              <Text style={tw`text-base font-semibold text-blue-900 mb-1`}>
                Створіть свій банер
              </Text>
              <Text style={tw`text-sm text-blue-800 mb-3`}>
                Розмістіть банер з вашою акцією у топі сторінки
              </Text>
              <Button
                title="Створити банер"
                onPress={() => router.push('/marketing/banners')}
                variant="secondary"
              />
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
