import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, Shield, Crown, Award, Check } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';

const ROLES = [
  {
    id: 'citizen' as UserRole,
    label: 'Користувач',
    description: 'Базовий функціонал для особистого використання',
    icon: User,
    color: '#6b7280',
  },
  {
    id: 'individual' as UserRole,
    label: 'Індивідуальний підприємець',
    description: 'Клієнти, замовлення, зустрічі',
    icon: User,
    color: '#3b82f6',
  },
  {
    id: 'small' as UserRole,
    label: 'Малий бізнес',
    description: 'Команда до 10 осіб, кампанії, аналітика',
    icon: Award,
    color: '#8b5cf6',
  },
  {
    id: 'medium' as UserRole,
    label: 'Середній бізнес',
    description: 'Необмежена команда, API, персональний менеджер',
    icon: Crown,
    color: '#f59e0b',
  },
  {
    id: 'admin' as UserRole,
    label: 'Адміністратор',
    description: 'Повний доступ до системи',
    icon: Shield,
    color: '#ef4444',
  },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    role: user?.role || 'citizen',
  });

  const handleSave = async () => {
    if (!user) return;

    if (!formData.full_name.trim()) {
      Alert.alert('Помилка', "Введіть ім'я");
      return;
    }

    try {
      setSaving(true);

      const updates = {
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        role: formData.role,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('users').update(updates).eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });

      Alert.alert('Успіх', 'Профіль оновлено', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Помилка', 'Не вдалося оновити профіль');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    if (role !== user?.role && ['small', 'medium'].includes(role)) {
      Alert.alert(
        'Зміна тарифу',
        `Для переходу на тариф "${
          ROLES.find((r) => r.id === role)?.label
        }" потрібна активна підписка. Перейти до вибору тарифу?`,
        [
          { text: 'Скасувати', style: 'cancel' },
          {
            text: 'Перейти',
            onPress: () => router.push('/profile/subscription'),
          },
        ]
      );
      return;
    }

    setFormData({ ...formData, role });
  };

  if (!user) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="Редагувати профіль" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-gray-600`}>Завантаження...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Редагувати профіль" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Особиста інформація
          </Text>

          <Input
            label="Повне ім'я *"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            placeholder="Іван Іваненко"
            icon={<User size={20} color="#6b7280" />}
          />

          <Input
            label="Email"
            value={user.email}
            editable={false}
            placeholder="example@email.com"
            icon={<Mail size={20} color="#6b7280" />}
          />
          <Text style={tw`text-xs text-gray-500 -mt-2 mb-3`}>
            Email не можна змінити
          </Text>

          <Input
            label="Телефон"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+380"
            keyboardType="phone-pad"
            icon={<Phone size={20} color="#6b7280" />}
          />
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
            Оберіть роль
          </Text>
          <Text style={tw`text-sm text-gray-600 mb-4`}>
            Роль визначає доступні функції та можливості
          </Text>

          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => handleRoleChange(role.id)}
              style={[
                tw`flex-row items-start p-4 rounded-lg mb-3 border`,
                formData.role === role.id
                  ? { borderColor: role.color, backgroundColor: `${role.color}10` }
                  : tw`border-gray-200 bg-white`,
              ]}
            >
              <View
                style={[
                  tw`w-12 h-12 rounded-full items-center justify-center mr-3`,
                  { backgroundColor: `${role.color}20` },
                ]}
              >
                {React.createElement(role.icon, {
                  size: 24,
                  color: role.color,
                })}
              </View>

              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                  {role.label}
                </Text>
                <Text style={tw`text-sm text-gray-600`}>{role.description}</Text>
              </View>

              {formData.role === role.id && (
                <View
                  style={[
                    tw`w-6 h-6 rounded-full items-center justify-center`,
                    { backgroundColor: role.color },
                  ]}
                >
                  <Check size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={tw`mb-4`}>
          <View style={tw`bg-blue-50 rounded-lg p-4 flex-row items-start`}>
            <View
              style={tw`w-8 h-8 rounded-full bg-blue-600 items-center justify-center mr-3 mt-0.5`}
            >
              <Text style={tw`text-white text-xs font-bold`}>!</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-blue-900 mb-1`}>
                Про зміну ролі
              </Text>
              <Text style={tw`text-sm text-blue-800`}>
                Зміна ролі на вищий тариф може вимагати активації підписки. Деякі
                функції стануть доступними після оплати.
              </Text>
            </View>
          </View>
        </Card>

        <Button
          title="Зберегти зміни"
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}
