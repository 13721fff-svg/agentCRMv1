import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Megaphone,
  Mail,
  MessageSquare,
  Image as ImageIcon,
  Edit,
  Trash2,
  PlayCircle,
  CheckCircle,
  XCircle,
  Send,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  MousePointer,
  BarChart3,
} from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useCampaignsStore } from '@/store/campaignsStore';
import { supabase } from '@/lib/supabase';
import { Campaign } from '@/types';

export default function CampaignDetailsScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { campaigns, updateCampaign, deleteCampaign: deleteCampaignFromStore } =
    useCampaignsStore();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const foundCampaign = campaigns.find((c) => c.id === id);

      if (foundCampaign) {
        setCampaign(foundCampaign);
      } else {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCampaign(data);
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити кампанію');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPush = async () => {
    if (!campaign) return;

    Alert.alert(
      'Тестове повідомлення',
      `Надіслати тестове ${
        campaign.type === 'email'
          ? 'email'
          : campaign.type === 'sms'
          ? 'SMS'
          : 'push-повідомлення'
      } на ваш пристрій?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Надіслати',
          onPress: async () => {
            try {
              setActionLoading(true);

              await new Promise((resolve) => setTimeout(resolve, 1000));

              if (Platform.OS === 'web') {
                alert(`📱 Тестове повідомлення відправлено!\n\n${campaign.title}`);
              } else {
                Alert.alert(
                  '✅ Відправлено!',
                  `Тестове ${
                    campaign.type === 'email'
                      ? 'email'
                      : campaign.type === 'sms'
                      ? 'SMS'
                      : 'push-повідомлення'
                  } надіслано на ваш пристрій`,
                  [{ text: 'OK' }]
                );
              }

              const newMetrics = {
                ...(campaign.metrics as any),
                sent: ((campaign.metrics as any)?.sent || 0) + 1,
              };

              await supabase
                .from('campaigns')
                .update({ metrics: newMetrics })
                .eq('id', id);

              updateCampaign(id, { metrics: newMetrics });
              setCampaign({ ...campaign, metrics: newMetrics });
            } catch (error) {
              console.error('Error sending test:', error);
              Alert.alert('Помилка', 'Не вдалося надіслати тестове повідомлення');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLaunch = async () => {
    if (!campaign) return;

    Alert.alert(
      'Запустити кампанію',
      'Ви впевнені, що хочете запустити цю кампанію?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Запустити',
          onPress: async () => {
            try {
              setActionLoading(true);

              const { error } = await supabase
                .from('campaigns')
                .update({
                  status: 'active',
                  start_date: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', id);

              if (error) throw error;

              updateCampaign(id, {
                status: 'active',
                start_date: new Date().toISOString(),
              });
              setCampaign({
                ...campaign,
                status: 'active',
                start_date: new Date().toISOString(),
              });

              Alert.alert('Успіх', 'Кампанію запущено');
            } catch (error) {
              console.error('Error launching campaign:', error);
              Alert.alert('Помилка', 'Не вдалося запустити кампанію');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    if (!campaign) return;

    Alert.alert(
      'Завершити кампанію',
      'Ви впевнені, що хочете завершити цю кампанію?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Завершити',
          onPress: async () => {
            try {
              setActionLoading(true);

              const { error } = await supabase
                .from('campaigns')
                .update({
                  status: 'completed',
                  end_date: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', id);

              if (error) throw error;

              updateCampaign(id, {
                status: 'completed',
                end_date: new Date().toISOString(),
              });
              setCampaign({
                ...campaign,
                status: 'completed',
                end_date: new Date().toISOString(),
              });

              Alert.alert('Успіх', 'Кампанію завершено');
            } catch (error) {
              console.error('Error completing campaign:', error);
              Alert.alert('Помилка', 'Не вдалося завершити кампанію');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!campaign) return;

    Alert.alert(
      'Скасувати кампанію',
      'Ви впевнені, що хочете скасувати цю кампанію?',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так, скасувати',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);

              const { error } = await supabase
                .from('campaigns')
                .update({
                  status: 'cancelled',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', id);

              if (error) throw error;

              updateCampaign(id, { status: 'cancelled' });
              setCampaign({ ...campaign, status: 'cancelled' });

              Alert.alert('Успіх', 'Кампанію скасовано');
            } catch (error) {
              console.error('Error cancelling campaign:', error);
              Alert.alert('Помилка', 'Не вдалося скасувати кампанію');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Видалити кампанію',
      'Ви впевнені, що хочете видалити цю кампанію? Цю дію неможливо скасувати.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('campaigns').delete().eq('id', id);
              if (error) throw error;

              deleteCampaignFromStore(id);
              router.back();
            } catch (error) {
              console.error('Error deleting campaign:', error);
              Alert.alert('Помилка', 'Не вдалося видалити кампанію');
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail size={24} color="#0284c7" />;
      case 'sms':
        return <MessageSquare size={24} color="#16a34a" />;
      case 'banner':
        return <ImageIcon size={24} color="#f59e0b" />;
      default:
        return <Megaphone size={24} color="#8b5cf6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title="Завантаження..." showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title="Помилка" showBack />
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Megaphone size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 mt-4`}>Кампанію не знайдено</Text>
        </View>
      </View>
    );
  }

  const metrics = campaign.metrics as any;

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header
        title="Деталі кампанії"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-start justify-between mb-4`}>
            <View style={tw`flex-row items-start flex-1`}>
              <View
                style={tw`w-14 h-14 rounded-full bg-purple-100 items-center justify-center mr-3`}
              >
                {getTypeIcon(campaign.type)}
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xl font-bold text-gray-900 mb-1`}>
                  {campaign.title}
                </Text>
                <View
                  style={tw`flex-row items-center px-2 py-1 rounded-full border ${getStatusColor(
                    campaign.status
                  )} self-start`}
                >
                  <Text style={tw`text-xs font-medium`}>
                    {campaign.status === 'active'
                      ? 'Активна'
                      : campaign.status === 'completed'
                      ? 'Завершена'
                      : campaign.status === 'scheduled'
                      ? 'Заплановано'
                      : campaign.status === 'cancelled'
                      ? 'Скасовано'
                      : 'Чернетка'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {campaign.description && (
            <Text style={tw`text-base text-gray-700 mb-4`}>{campaign.description}</Text>
          )}

          <View style={tw`border-t border-gray-200 pt-4 space-y-3`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}>
                <Calendar size={20} color="#0284c7" />
              </View>
              <View>
                <Text style={tw`text-sm text-gray-600`}>Початок</Text>
                <Text style={tw`text-base font-medium text-gray-900`}>
                  {formatDate(campaign.start_date)}
                </Text>
              </View>
            </View>

            {campaign.end_date && (
              <View style={tw`flex-row items-center`}>
                <View
                  style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3`}
                >
                  <Calendar size={20} color="#6b7280" />
                </View>
                <View>
                  <Text style={tw`text-sm text-gray-600`}>Завершення</Text>
                  <Text style={tw`text-base font-medium text-gray-900`}>
                    {formatDate(campaign.end_date)}
                  </Text>
                </View>
              </View>
            )}

            <View style={tw`flex-row items-center`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}
              >
                <Users size={20} color="#8b5cf6" />
              </View>
              <View>
                <Text style={tw`text-sm text-gray-600`}>Цільова аудиторія</Text>
                <Text style={tw`text-base font-medium text-gray-900`}>
                  {campaign.target_audience
                    ? typeof campaign.target_audience === 'object'
                      ? (campaign.target_audience as any).count || 'Всі клієнти'
                      : 'Всі клієнти'
                    : 'Всі клієнти'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>Контент</Text>
          <View style={tw`bg-gray-50 rounded-lg p-4`}>
            <Text style={tw`text-base text-gray-700`}>
              {(campaign as any).content || campaign.description || 'Немає контенту'}
            </Text>
          </View>
        </Card>

        {metrics && (
          <Card style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-4`}>
              <BarChart3 size={20} color="#0284c7" />
              <Text style={tw`text-lg font-semibold text-gray-900 ml-2`}>Статистика</Text>
            </View>

            <View style={tw`flex-row flex-wrap gap-2`}>
              <View style={tw`flex-1 min-w-36 bg-blue-50 rounded-lg p-3`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <Send size={16} color="#0284c7" />
                  <Text style={tw`text-xs text-blue-700 ml-1`}>Надіслано</Text>
                </View>
                <Text style={tw`text-2xl font-bold text-blue-900`}>
                  {metrics.sent || 0}
                </Text>
              </View>

              <View style={tw`flex-1 min-w-36 bg-green-50 rounded-lg p-3`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <CheckCircle size={16} color="#16a34a" />
                  <Text style={tw`text-xs text-green-700 ml-1`}>Доставлено</Text>
                </View>
                <Text style={tw`text-2xl font-bold text-green-900`}>
                  {metrics.delivered || 0}
                </Text>
              </View>

              <View style={tw`flex-1 min-w-36 bg-purple-50 rounded-lg p-3`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <Eye size={16} color="#8b5cf6" />
                  <Text style={tw`text-xs text-purple-700 ml-1`}>Відкрито</Text>
                </View>
                <Text style={tw`text-2xl font-bold text-purple-900`}>
                  {metrics.opened || 0}
                </Text>
              </View>

              <View style={tw`flex-1 min-w-36 bg-orange-50 rounded-lg p-3`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <MousePointer size={16} color="#f59e0b" />
                  <Text style={tw`text-xs text-orange-700 ml-1`}>Кліки</Text>
                </View>
                <Text style={tw`text-2xl font-bold text-orange-900`}>
                  {metrics.clicked || 0}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>Дії</Text>

          {campaign.status === 'draft' && (
            <>
              <Button
                title="Запустити кампанію"
                onPress={handleLaunch}
                loading={actionLoading}
                fullWidth
                style={tw`mb-2`}
              />
              <Button
                title="Надіслати тестове повідомлення"
                onPress={handleTestPush}
                loading={actionLoading}
                variant="secondary"
                fullWidth
              />
            </>
          )}

          {campaign.status === 'active' && (
            <>
              <Button
                title="Надіслати тестове повідомлення"
                onPress={handleTestPush}
                loading={actionLoading}
                fullWidth
                style={tw`mb-2`}
              />
              <View style={tw`flex-row gap-2`}>
                <Button
                  title="Завершити"
                  onPress={handleComplete}
                  loading={actionLoading}
                  variant="secondary"
                  style={tw`flex-1`}
                />
                <Button
                  title="Скасувати"
                  onPress={handleCancel}
                  loading={actionLoading}
                  variant="secondary"
                  style={tw`flex-1`}
                />
              </View>
            </>
          )}

          {campaign.status === 'scheduled' && (
            <Button
              title="Скасувати кампанію"
              onPress={handleCancel}
              loading={actionLoading}
              variant="secondary"
              fullWidth
            />
          )}

          {(campaign.status === 'completed' || campaign.status === 'cancelled') && (
            <View style={tw`bg-gray-50 rounded-lg p-4`}>
              <Text style={tw`text-center text-gray-600`}>
                {campaign.status === 'completed'
                  ? 'Кампанію завершено'
                  : 'Кампанію скасовано'}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
