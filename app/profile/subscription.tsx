import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Crown,
  Check,
  X,
  Users,
  BarChart3,
  Megaphone,
  Shield,
  Award,
  TrendingUp,
  Calendar,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore, SubscriptionPlan } from '@/store/subscriptionStore';
import { supabase } from '@/lib/supabase';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { plans, currentSubscription, currentUsage, setPlans, setCurrentSubscription, setCurrentUsage } =
    useSubscriptionStore();

  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);

      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (plansError) throw plansError;
      if (plansData) setPlans(plansData);

      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) throw subError;
      if (subData) setCurrentSubscription(subData);

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: usageData, error: usageError } = await supabase
        .from('subscription_usage')
        .select('*')
        .eq('org_id', user.org_id)
        .gte('period_start', periodStart.toISOString())
        .lte('period_end', periodEnd.toISOString())
        .maybeSingle();

      if (usageError && usageError.code !== 'PGRST116') throw usageError;

      if (!usageData) {
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', user.org_id);

        const { count: teamCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', user.org_id);

        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', user.org_id)
          .gte('created_at', periodStart.toISOString());

        setCurrentUsage({
          id: '',
          org_id: user.org_id,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          clients_count: clientsCount || 0,
          team_members_count: teamCount || 0,
          orders_count: ordersCount || 0,
          created_at: new Date().toISOString(),
        });
      } else {
        setCurrentUsage(usageData);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані підписки');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (currentSubscription?.plan_id === plan.id) {
      Alert.alert('Інформація', 'Ви вже використовуєте цей тариф');
      return;
    }

    Alert.alert(
      `Обрати тариф "${plan.name}"?`,
      `Вартість: ${billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly} грн/${
        billingPeriod === 'monthly' ? 'місяць' : 'рік'
      }`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Підтвердити',
          onPress: () => handleUpgrade(plan),
        },
      ]
    );
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    Alert.alert(
      'Демо режим',
      'Оплата буде доступна після інтеграції з платіжною системою. Наразі тариф оновлено в демо-режимі.',
      [
        {
          text: 'Зрозуміло',
          onPress: async () => {
            if (!user?.org_id) return;

            try {
              const periodStart = new Date();
              const periodEnd = new Date();
              periodEnd.setMonth(periodEnd.getMonth() + (billingPeriod === 'monthly' ? 1 : 12));

              const { data, error } = await supabase
                .from('subscriptions')
                .insert({
                  org_id: user.org_id,
                  plan_id: plan.id,
                  status: 'trial',
                  current_period_start: periodStart.toISOString(),
                  current_period_end: periodEnd.toISOString(),
                  trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                })
                .select()
                .single();

              if (error) throw error;

              await loadSubscriptionData();
              Alert.alert('Успіх', 'Тариф успішно оновлено! 14 днів безкоштовного пробного періоду.');
            } catch (error) {
              console.error('Error upgrading:', error);
              Alert.alert('Помилка', 'Не вдалося оновити тариф');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#16a34a';
      case 'trial':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'trial':
        return 'Пробний період';
      case 'cancelled':
        return 'Скасована';
      case 'expired':
        return 'Завершена';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="Підписка і тариф" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Підписка і тариф" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        {currentSubscription && (
          <Card style={tw`mb-4`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <Text style={tw`text-lg font-semibold text-gray-900`}>Поточна підписка</Text>
              <View
                style={[
                  tw`px-3 py-1 rounded-full`,
                  { backgroundColor: `${getStatusColor(currentSubscription.status)}20` },
                ]}
              >
                <Text
                  style={[tw`text-xs font-semibold`, { color: getStatusColor(currentSubscription.status) }]}
                >
                  {getStatusLabel(currentSubscription.status)}
                </Text>
              </View>
            </View>

            {currentSubscription.plan && (
              <>
                <Text style={tw`text-2xl font-bold text-gray-900 mb-1`}>
                  {currentSubscription.plan.name}
                </Text>
                <View style={tw`flex-row items-baseline mb-4`}>
                  <Text style={tw`text-3xl font-bold text-gray-900`}>
                    ₴{currentSubscription.plan.price_monthly}
                  </Text>
                  <Text style={tw`text-gray-600 ml-2`}>/ місяць</Text>
                </View>
              </>
            )}

            {currentSubscription.status === 'trial' && currentSubscription.trial_end && (
              <View style={tw`bg-blue-50 rounded-lg p-3 mb-3`}>
                <Text style={tw`text-sm text-blue-900 font-medium`}>
                  Пробний період до {new Date(currentSubscription.trial_end).toLocaleDateString('uk-UA')}
                </Text>
              </View>
            )}

            {currentUsage && currentSubscription.plan && (
              <View style={tw`bg-gray-50 rounded-lg p-3`}>
                <Text style={tw`text-sm font-semibold text-gray-900 mb-2`}>Використання</Text>
                <View style={tw`space-y-2`}>
                  <View style={tw`flex-row items-center justify-between`}>
                    <Text style={tw`text-sm text-gray-600`}>Клієнти</Text>
                    <Text style={tw`text-sm font-medium text-gray-900`}>
                      {currentUsage.clients_count} / {currentSubscription.plan.max_clients}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center justify-between`}>
                    <Text style={tw`text-sm text-gray-600`}>Команда</Text>
                    <Text style={tw`text-sm font-medium text-gray-900`}>
                      {currentUsage.team_members_count} / {currentSubscription.plan.max_team_members}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center justify-between`}>
                    <Text style={tw`text-sm text-gray-600`}>Замовлення (цей місяць)</Text>
                    <Text style={tw`text-sm font-medium text-gray-900`}>
                      {currentUsage.orders_count} / {currentSubscription.plan.max_orders_per_month}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card>
        )}

        <View style={tw`flex-row items-center justify-between mb-4`}>
          <Text style={tw`text-2xl font-bold text-gray-900`}>Доступні тарифи</Text>
          <View style={tw`flex-row bg-gray-200 rounded-lg p-1`}>
            <TouchableOpacity
              onPress={() => setBillingPeriod('monthly')}
              style={[
                tw`px-3 py-1 rounded-md`,
                billingPeriod === 'monthly' && tw`bg-white shadow-sm`,
              ]}
            >
              <Text
                style={tw`text-sm font-medium ${
                  billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                Місяць
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setBillingPeriod('yearly')}
              style={[
                tw`px-3 py-1 rounded-md`,
                billingPeriod === 'yearly' && tw`bg-white shadow-sm`,
              ]}
            >
              <Text
                style={tw`text-sm font-medium ${
                  billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                Рік (-17%)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {plans.map((plan, index) => (
          <Card key={plan.id} style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-3`}>
              <View
                style={[
                  tw`w-12 h-12 rounded-full items-center justify-center mr-3`,
                  { backgroundColor: '#0284c720' },
                ]}
              >
                {index === 0 && <Award size={24} color="#0284c7" />}
                {index === 1 && <TrendingUp size={24} color="#0284c7" />}
                {index === 2 && <Crown size={24} color="#0284c7" />}
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>{plan.name}</Text>
                <View style={tw`flex-row items-baseline`}>
                  <Text style={tw`text-2xl font-bold text-gray-900`}>
                    ₴{billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly}
                  </Text>
                  <Text style={tw`text-gray-600 ml-1`}>
                    / {billingPeriod === 'monthly' ? 'місяць' : 'рік'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center mb-2`}>
                <Users size={16} color="#6b7280" />
                <Text style={tw`text-sm text-gray-600 ml-2`}>
                  До {plan.max_clients} клієнтів
                </Text>
              </View>
              <View style={tw`flex-row items-center mb-2`}>
                <Users size={16} color="#6b7280" />
                <Text style={tw`text-sm text-gray-600 ml-2`}>
                  {plan.max_team_members} {plan.max_team_members === 1 ? 'користувач' : 'користувачів'} в команді
                </Text>
              </View>
              <View style={tw`flex-row items-center mb-2`}>
                <Calendar size={16} color="#6b7280" />
                <Text style={tw`text-sm text-gray-600 ml-2`}>
                  До {plan.max_orders_per_month} замовлень/міс
                </Text>
              </View>

              <View style={tw`border-t border-gray-200 my-3`} />

              <View style={tw`space-y-2`}>
                {plan.features.analytics && (
                  <View style={tw`flex-row items-center`}>
                    <Check size={16} color="#16a34a" />
                    <Text style={tw`text-sm text-gray-900 ml-2`}>Аналітика та звіти</Text>
                  </View>
                )}
                {plan.features.campaigns && (
                  <View style={tw`flex-row items-center`}>
                    <Check size={16} color="#16a34a" />
                    <Text style={tw`text-sm text-gray-900 ml-2`}>Маркетингові кампанії</Text>
                  </View>
                )}
                {plan.features.team && (
                  <View style={tw`flex-row items-center`}>
                    <Check size={16} color="#16a34a" />
                    <Text style={tw`text-sm text-gray-900 ml-2`}>Управління командою</Text>
                  </View>
                )}
                {plan.features.api && (
                  <View style={tw`flex-row items-center`}>
                    <Check size={16} color="#16a34a" />
                    <Text style={tw`text-sm text-gray-900 ml-2`}>API доступ</Text>
                  </View>
                )}
              </View>
            </View>

            <Button
              title={
                currentSubscription?.plan_id === plan.id ? 'Поточний тариф' : 'Обрати тариф'
              }
              onPress={() => handleSelectPlan(plan)}
              variant={currentSubscription?.plan_id === plan.id ? 'outline' : 'primary'}
              disabled={currentSubscription?.plan_id === plan.id}
              fullWidth
            />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
