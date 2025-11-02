import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Star } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const getRoleName = (role: string) => {
    switch (role) {
      case 'citizen':
        return 'Користувач';
      case 'individual':
        return 'Індивідуальний підприємець';
      case 'small':
        return 'Малий бізнес';
      case 'medium':
        return 'Середній бізнес';
      case 'admin':
        return 'Адміністратор';
      default:
        return role;
    }
  };

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header title={t('profile.title')} showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`items-center py-6`}>
            <View style={tw`w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-4`}>
              <User size={48} color="#0284c7" />
            </View>
            <Text style={tw`text-2xl font-bold text-neutral-900 mb-2`}>
              {user?.full_name}
            </Text>
            <Text style={tw`text-neutral-600 mb-2`}>{getRoleName(user?.role || '')}</Text>
            {user?.rating && (
              <View style={tw`flex-row items-center`}>
                <Star size={20} color="#f59e0b" fill="#f59e0b" />
                <Text style={tw`text-lg font-semibold text-neutral-900 ml-1`}>
                  {user.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-neutral-900 mb-4`}>
            Контактна інформація
          </Text>

          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3`}>
              <Mail size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm text-neutral-600 mb-1`}>Email</Text>
              <Text style={tw`text-base text-neutral-900`}>{user?.email}</Text>
            </View>
          </View>

          {user?.phone && (
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-10 h-10 rounded-full bg-success-100 items-center justify-center mr-3`}>
                <Phone size={20} color="#22c55e" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm text-neutral-600 mb-1`}>Телефон</Text>
                <Text style={tw`text-base text-neutral-900`}>{user.phone}</Text>
              </View>
            </View>
          )}
        </Card>

        <Card>
          <Text style={tw`text-lg font-semibold text-neutral-900 mb-2`}>
            Статистика
          </Text>
          <View style={tw`flex-row justify-between py-3 border-b border-neutral-200`}>
            <Text style={tw`text-neutral-600`}>Дата реєстрації</Text>
            <Text style={tw`text-neutral-900 font-medium`}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('uk-UA') : '-'}
            </Text>
          </View>
          <View style={tw`flex-row justify-between py-3`}>
            <Text style={tw`text-neutral-600`}>Останнє оновлення</Text>
            <Text style={tw`text-neutral-900 font-medium`}>
              {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('uk-UA') : '-'}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
