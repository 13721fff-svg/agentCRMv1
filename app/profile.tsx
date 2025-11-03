import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  User,
  Mail,
  Phone,
  Star,
  Camera,
  Edit,
  QrCode,
  CreditCard,
  Bell,
  Shield,
  ChevronRight,
  Crown,
  Award,
} from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

const ROLE_CONFIG = {
  citizen: {
    label: 'Користувач',
    color: '#6b7280',
    icon: User,
    features: ['Базовий функціонал', 'Створення замовлень', 'Перегляд каталогу'],
  },
  individual: {
    label: 'Індивідуальний підприємець',
    color: '#3b82f6',
    icon: User,
    features: ['Клієнти', 'Замовлення', 'Зустрічі', 'Базова аналітика'],
  },
  small: {
    label: 'Малий бізнес',
    color: '#8b5cf6',
    icon: Award,
    features: [
      'Все з Individual',
      'Команда до 10 осіб',
      'Кампанії',
      'Розширена аналітика',
    ],
  },
  medium: {
    label: 'Середній бізнес',
    color: '#f59e0b',
    icon: Crown,
    features: [
      'Все з Small',
      'Необмежена команда',
      'Пріоритетна підтримка',
      'API доступ',
    ],
  },
  admin: {
    label: 'Адміністратор',
    color: '#ef4444',
    icon: Shield,
    features: ['Повний доступ', 'Управління системою', 'Всі можливості'],
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { user, setUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);

  const roleConfig = user ? ROLE_CONFIG[user.role] : null;

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Помилка', 'Необхідний доступ до галереї');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати зображення');
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Недоступно', 'Камера не підтримується на веб-платформі');
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Помилка', 'Необхідний доступ до камери');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Помилка', 'Не вдалося зробити фото');
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;

    try {
      setUploading(true);

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({ ...user, avatar_url: publicUrl });
      Alert.alert('Успіх', 'Аватар оновлено');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити аватар');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarPress = () => {
    Alert.alert('Оберіть дію', '', [
      { text: 'Вибрати з галереї', onPress: handlePickImage },
      { text: 'Зробити фото', onPress: handleTakePhoto },
      { text: 'Скасувати', style: 'cancel' },
    ]);
  };

  const handleShowQR = () => {
    router.push('/profile/qr');
  };

  const handleSubscription = () => {
    router.push('/profile/subscription');
  };

  const handleNotifications = () => {
    router.push('/profile/notifications');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (!user) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title="Профіль" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-gray-600`}>Завантаження...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header
        title="Профіль"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleEditProfile}>
            <Edit size={20} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`items-center py-6`}>
            <TouchableOpacity
              onPress={handleAvatarPress}
              disabled={uploading}
              style={tw`relative mb-4`}
            >
              {user.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={tw`w-24 h-24 rounded-full`}
                />
              ) : (
                <View
                  style={tw`w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 items-center justify-center`}
                >
                  <Text style={tw`text-4xl font-bold text-white`}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View
                style={tw`absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 items-center justify-center border-2 border-white`}
              >
                <Camera size={16} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
              {user.full_name}
            </Text>

            {roleConfig && (
              <View
                style={[
                  tw`px-4 py-1.5 rounded-full flex-row items-center mb-2`,
                  { backgroundColor: `${roleConfig.color}20` },
                ]}
              >
                {React.createElement(roleConfig.icon, {
                  size: 16,
                  color: roleConfig.color,
                })}
                <Text
                  style={[tw`text-sm font-semibold ml-1`, { color: roleConfig.color }]}
                >
                  {roleConfig.label}
                </Text>
              </View>
            )}

            {user.rating !== undefined && (
              <View style={tw`flex-row items-center`}>
                <Star size={20} color="#f59e0b" fill="#f59e0b" />
                <Text style={tw`text-lg font-semibold text-gray-900 ml-1`}>
                  {user.rating.toFixed(1)}
                </Text>
                <Text style={tw`text-sm text-gray-600 ml-1`}>рейтинг</Text>
              </View>
            )}
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-4`}>
            Контактна інформація
          </Text>

          <View style={tw`flex-row items-center mb-3`}>
            <View
              style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
            >
              <Mail size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm text-gray-600 mb-1`}>Email</Text>
              <Text style={tw`text-base text-gray-900`}>{user.email}</Text>
            </View>
          </View>

          {user.phone && (
            <View style={tw`flex-row items-center`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}
              >
                <Phone size={20} color="#16a34a" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm text-gray-600 mb-1`}>Телефон</Text>
                <Text style={tw`text-base text-gray-900`}>{user.phone}</Text>
              </View>
            </View>
          )}
        </Card>

        {roleConfig && roleConfig.features && (
          <Card style={tw`mb-4`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
              Доступні можливості
            </Text>
            {roleConfig.features.map((feature, index) => (
              <View
                key={index}
                style={tw`flex-row items-center py-2 ${
                  index < roleConfig.features.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View style={tw`w-2 h-2 rounded-full bg-blue-600 mr-3`} />
                <Text style={tw`text-sm text-gray-700`}>{feature}</Text>
              </View>
            ))}
          </Card>
        )}

        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>Дії</Text>

          <TouchableOpacity
            onPress={handleShowQR}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}
              >
                <QrCode size={20} color="#8b5cf6" />
              </View>
              <Text style={tw`text-base text-gray-900`}>QR-візитка</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubscription}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-3`}
              >
                <CreditCard size={20} color="#f59e0b" />
              </View>
              <Text style={tw`text-base text-gray-900`}>Підписка і тариф</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNotifications}
            style={tw`flex-row items-center justify-between py-3`}
          >
            <View style={tw`flex-row items-center`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
              >
                <Bell size={20} color="#0284c7" />
              </View>
              <Text style={tw`text-base text-gray-900`}>Сповіщення</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-2`}>Статистика</Text>
          <View style={tw`flex-row justify-between py-3 border-b border-gray-100`}>
            <Text style={tw`text-gray-600`}>Дата реєстрації</Text>
            <Text style={tw`text-gray-900 font-medium`}>
              {new Date(user.created_at).toLocaleDateString('uk-UA')}
            </Text>
          </View>
          <View style={tw`flex-row justify-between py-3`}>
            <Text style={tw`text-gray-600`}>Останнє оновлення</Text>
            <Text style={tw`text-gray-900 font-medium`}>
              {new Date(user.updated_at).toLocaleDateString('uk-UA')}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
