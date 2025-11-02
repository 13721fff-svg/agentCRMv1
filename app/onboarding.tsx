import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { User, Briefcase, Users, Building2 } from 'lucide-react-native';
import tw from '@/lib/tw';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { UserRole } from '@/types';

const roles = [
  {
    id: 'citizen' as UserRole,
    icon: User,
    color: '#0ea5e9',
  },
  {
    id: 'individual' as UserRole,
    icon: Briefcase,
    color: '#22c55e',
  },
  {
    id: 'small' as UserRole,
    icon: Users,
    color: '#f59e0b',
  },
  {
    id: 'medium' as UserRole,
    icon: Building2,
    color: '#ef4444',
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setOnboarded = useAppStore((state) => state.setOnboarded);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      await authService.updateProfile({ role: selectedRole });
      const user = await authService.getCurrentUser();
      setUser(user);
      setOnboarded(true);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to update role:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-white`} contentContainerStyle={tw`px-6 py-12`}>
      <View style={tw`mb-8`}>
        <Text style={tw`text-3xl font-bold text-neutral-900 mb-2`}>
          {t('onboarding.welcome')}
        </Text>
        <Text style={tw`text-lg text-neutral-600`}>
          {t('onboarding.selectRole')}
        </Text>
      </View>

      <View style={tw`mb-8`}>
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <TouchableOpacity
              key={role.id}
              onPress={() => setSelectedRole(role.id)}
              activeOpacity={0.7}
            >
              <Card
                style={tw`mb-4 ${
                  isSelected ? 'border-2 border-primary-600 bg-primary-50' : ''
                }`}
              >
                <View style={tw`flex-row items-center`}>
                  <View
                    style={tw.style(
                      'w-12 h-12 rounded-full items-center justify-center mr-4',
                      { backgroundColor: isSelected ? role.color : '#f5f5f5' }
                    )}
                  >
                    <Icon size={24} color={isSelected ? 'white' : role.color} />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-lg font-semibold text-neutral-900 mb-1`}>
                      {t(`onboarding.${role.id}`)}
                    </Text>
                    <Text style={tw`text-sm text-neutral-600`}>
                      {t(`onboarding.${role.id}Desc`)}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title={t('common.done')}
        onPress={handleComplete}
        disabled={!selectedRole}
        loading={loading}
        fullWidth
      />
    </ScrollView>
  );
}
