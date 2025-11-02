import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  User,
  Settings,
  Users,
  Calendar,
  TrendingUp,
  Megaphone,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export default function MoreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      logout();
      router.replace('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    {
      id: 'profile',
      title: t('profile.title'),
      icon: User,
      color: '#0ea5e9',
      onPress: () => router.push('/profile'),
    },
    {
      id: 'team',
      title: t('team.title'),
      icon: Users,
      color: '#22c55e',
      onPress: () => router.push('/team'),
      roles: ['small', 'medium'],
    },
    {
      id: 'meetings',
      title: 'Зустрічі',
      icon: Calendar,
      color: '#f59e0b',
      onPress: () => router.push('/meetings'),
      roles: ['individual', 'small', 'medium'],
    },
    {
      id: 'kpi',
      title: 'KPI та Плани',
      icon: TrendingUp,
      color: '#ef4444',
      onPress: () => router.push('/kpi'),
      roles: ['small', 'medium'],
    },
    {
      id: 'campaigns',
      title: t('campaigns.title'),
      icon: Megaphone,
      color: '#8b5cf6',
      onPress: () => router.push('/campaigns'),
      roles: ['individual', 'small', 'medium'],
    },
    {
      id: 'settings',
      title: t('profile.settings'),
      icon: Settings,
      color: '#737373',
      onPress: () => router.push('/settings'),
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || 'citizen')
  );

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header title={t('tabs.more')} />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-6`}>
          <View style={tw`items-center py-4`}>
            <View style={tw`w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3`}>
              <User size={40} color="#0284c7" />
            </View>
            <Text style={tw`text-xl font-bold text-neutral-900 mb-1`}>
              {user?.full_name}
            </Text>
            <Text style={tw`text-neutral-600`}>{user?.email}</Text>
            {user?.rating && (
              <Text style={tw`text-warning-600 font-medium mt-2`}>
                ★ {user.rating.toFixed(1)}
              </Text>
            )}
          </View>
        </Card>

        <View>
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Card style={tw`mb-3`}>
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-row items-center flex-1`}>
                      <View
                        style={tw.style(
                          'w-10 h-10 rounded-full items-center justify-center mr-3',
                          { backgroundColor: item.color + '20' }
                        )}
                      >
                        <Icon size={20} color={item.color} />
                      </View>
                      <Text style={tw`text-base font-medium text-neutral-900`}>
                        {item.title}
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#a3a3a3" />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Card>
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View
                    style={tw`w-10 h-10 rounded-full items-center justify-center mr-3 bg-error-100`}
                  >
                    <LogOut size={20} color="#ef4444" />
                  </View>
                  <Text style={tw`text-base font-medium text-error-600`}>
                    {t('auth.logout')}
                  </Text>
                </View>
                <ChevronRight size={20} color="#a3a3a3" />
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
