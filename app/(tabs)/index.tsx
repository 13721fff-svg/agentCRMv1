import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Users, ShoppingBag, Calendar, TrendingUp } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { useAuthStore } from '@/store/authStore';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const quickActions = [
    {
      id: 'newOrder',
      title: 'Створити замовлення',
      icon: Plus,
      color: '#0ea5e9',
      onPress: () => router.push('/orders/create'),
      roles: ['individual', 'small', 'medium'],
    },
    {
      id: 'newClient',
      title: 'Додати клієнта',
      icon: Users,
      color: '#22c55e',
      onPress: () => router.push('/clients/create'),
      roles: ['individual', 'small', 'medium'],
    },
    {
      id: 'catalog',
      title: 'Каталог послуг',
      icon: ShoppingBag,
      color: '#f59e0b',
      onPress: () => router.push('/(tabs)/catalog'),
      roles: ['citizen'],
    },
    {
      id: 'meeting',
      title: 'Планувати зустріч',
      icon: Calendar,
      color: '#ef4444',
      onPress: () => router.push('/meetings/create'),
      roles: ['small', 'medium'],
    },
  ];

  const stats = [
    { label: 'Замовлення', value: '12', icon: ShoppingBag, color: '#0ea5e9' },
    { label: 'Клієнти', value: '45', icon: Users, color: '#22c55e' },
    { label: 'Доход', value: '₴25K', icon: TrendingUp, color: '#f59e0b' },
  ];

  const filteredActions = quickActions.filter(
    (action) => !action.roles || action.roles.includes(user?.role || 'citizen')
  );

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header title={t('home.title')} />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <View style={tw`mb-6`}>
          <Text style={tw`text-2xl font-bold text-neutral-900 mb-2`}>
            Вітаємо, {user?.full_name}!
          </Text>
          <Text style={tw`text-neutral-600`}>
            {user?.role === 'citizen'
              ? 'Знайдіть потрібні послуги'
              : 'Керуйте своїм бізнесом ефективно'}
          </Text>
        </View>

        {user?.role !== 'citizen' && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-semibold text-neutral-900 mb-3`}>
              {t('home.stats')}
            </Text>
            <View style={tw`flex-row justify-between`}>
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} style={tw`flex-1 mx-1`}>
                    <View style={tw`items-center`}>
                      <View
                        style={tw.style('w-10 h-10 rounded-full items-center justify-center mb-2', {
                          backgroundColor: stat.color + '20',
                        })}
                      >
                        <Icon size={20} color={stat.color} />
                      </View>
                      <Text style={tw`text-2xl font-bold text-neutral-900`}>{stat.value}</Text>
                      <Text style={tw`text-sm text-neutral-600`}>{stat.label}</Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-semibold text-neutral-900 mb-3`}>
            {t('home.quickActions')}
          </Text>
          <View style={tw`flex-row flex-wrap`}>
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  onPress={action.onPress}
                  style={tw`w-1/2 p-2`}
                  activeOpacity={0.7}
                >
                  <Card>
                    <View style={tw`items-center py-4`}>
                      <View
                        style={tw.style(
                          'w-12 h-12 rounded-full items-center justify-center mb-2',
                          { backgroundColor: action.color + '20' }
                        )}
                      >
                        <Icon size={24} color={action.color} />
                      </View>
                      <Text style={tw`text-sm font-medium text-neutral-900 text-center`}>
                        {action.title}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {user?.role !== 'citizen' && (
          <>
            <View style={tw`mb-6`}>
              <Text style={tw`text-lg font-semibold text-neutral-900 mb-3`}>
                {t('home.recentOrders')}
              </Text>
              <Card>
                <Text style={tw`text-neutral-600 text-center py-4`}>
                  Немає останніх замовлень
                </Text>
              </Card>
            </View>

            <View>
              <Text style={tw`text-lg font-semibold text-neutral-900 mb-3`}>
                {t('home.reminders')}
              </Text>
              <Card>
                <Text style={tw`text-neutral-600 text-center py-4`}>
                  Немає нагадувань
                </Text>
              </Card>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
