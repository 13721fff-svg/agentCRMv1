import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Globe,
  Moon,
  Bell,
  ChevronRight,
  Trash2,
  Shield,
  Database,
  Info,
  HelpCircle,
  LogOut,
  Link,
  Sun,
  Smartphone,
  DollarSign,
} from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { t, i18n } = useTranslation();
  const { theme, language, setTheme, setLanguage } = useAppStore();
  const { user, logout } = useAuthStore();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadPushSettings();
  }, []);

  const loadPushSettings = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('users')
        .select('push_token')
        .eq('id', user.id)
        .single();

      setPushEnabled(!!data?.push_token);
    } catch (error) {
      console.error('Error loading push settings:', error);
    }
  };

  const handleLanguagePress = () => {
    Alert.alert('Оберіть мову', '', [
      {
        text: 'Українська',
        onPress: () => {
          setLanguage('uk');
          i18n.changeLanguage('uk');
        },
      },
      {
        text: 'English',
        onPress: () => {
          setLanguage('en');
          i18n.changeLanguage('en');
        },
      },
      { text: 'Скасувати', style: 'cancel' },
    ]);
  };

  const handleThemePress = () => {
    Alert.alert('Оберіть тему', '', [
      {
        text: 'Світла',
        onPress: () => setTheme('light'),
      },
      {
        text: 'Темна',
        onPress: () => setTheme('dark'),
      },
      {
        text: 'Системна',
        onPress: () => Alert.alert('Інформація', 'Системна тема буде доступна в наступній версії'),
      },
      { text: 'Скасувати', style: 'cancel' },
    ]);
  };

  const handlePushToggle = async () => {
    if (!user) return;

    try {
      const newValue = !pushEnabled;
      setPushEnabled(newValue);

      await supabase
        .from('users')
        .update({
          push_token: newValue ? 'enabled' : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      Alert.alert(
        'Успіх',
        newValue
          ? 'Push-сповіщення увімкнено. Налаштуйте типи в розділі Профіль → Сповіщення'
          : 'Push-сповіщення вимкнено'
      );
    } catch (error) {
      console.error('Error toggling push:', error);
      setPushEnabled(!pushEnabled);
      Alert.alert('Помилка', 'Не вдалося змінити налаштування');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Очистити кеш',
      'Це видалить тимчасові файли та дані. Продовжити?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Очистити',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearing(true);
              await AsyncStorage.clear();
              Alert.alert('Успіх', 'Кеш очищено');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Помилка', 'Не вдалося очистити кеш');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Вийти', 'Ви впевнені, що хочете вийти з облікового запису?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Вийти',
        style: 'destructive',
        onPress: async () => {
          logout();
          await supabase.auth.signOut();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      default:
        return Smartphone;
    }
  };

  const getThemeName = () => {
    switch (theme) {
      case 'light':
        return 'Світла';
      case 'dark':
        return 'Темна';
      default:
        return 'Системна';
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header title="Налаштування" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text style={tw`text-sm font-semibold text-gray-600 mb-2 ml-1`}>
          Загальні
        </Text>

        <Card style={tw`mb-4`}>
          <TouchableOpacity
            onPress={handleLanguagePress}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
              >
                <Globe size={20} color="#0284c7" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>Мова</Text>
                <Text style={tw`text-sm text-gray-600`}>
                  {language === 'uk' ? 'Українська' : 'English'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleThemePress}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}
              >
                {React.createElement(getThemeIcon(), { size: 20, color: '#8b5cf6' })}
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>Тема</Text>
                <Text style={tw`text-sm text-gray-600`}>{getThemeName()}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        <Text style={tw`text-sm font-semibold text-gray-600 mb-2 ml-1`}>
          Сповіщення
        </Text>

        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-center justify-between py-2`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-3`}
              >
                <Bell size={20} color="#f59e0b" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                  Push-сповіщення
                </Text>
                <Text style={tw`text-sm text-gray-600`}>
                  Отримувати сповіщення на пристрій
                </Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handlePushToggle}
              trackColor={{ false: '#d1d5db', true: '#0284c7' }}
              thumbColor="#fff"
            />
          </View>

          {pushEnabled && (
            <View style={tw`mt-3 pt-3 border-t border-gray-100`}>
              <TouchableOpacity
                onPress={() => router.push('/profile/notifications')}
                style={tw`flex-row items-center justify-between`}
              >
                <Text style={tw`text-sm text-blue-600`}>
                  Налаштувати типи сповіщень
                </Text>
                <ChevronRight size={16} color="#0284c7" />
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <Text style={tw`text-sm font-semibold text-gray-600 mb-2 ml-1`}>
          Інтеграції
        </Text>

        <Card style={tw`mb-4`}>
          <TouchableOpacity
            onPress={() => router.push('/integrations/payments')}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}
              >
                <DollarSign size={20} color="#16a34a" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                  Платежі та оплата
                </Text>
                <Text style={tw`text-sm text-gray-600`}>LiqPay інтеграція</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/integrations/calendar')}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
              >
                <Link size={20} color="#0284c7" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                  Календар
                </Text>
                <Text style={tw`text-sm text-gray-600`}>Google, Outlook</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/integrations/email')}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}
              >
                <Link size={20} color="#8b5cf6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                  Email
                </Text>
                <Text style={tw`text-sm text-gray-600`}>Gmail, Outlook, SMTP</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/settings/audit')}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3`}
              >
                <Shield size={20} color="#f59e0b" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                  Журнал дій
                </Text>
                <Text style={tw`text-sm text-gray-600`}>Audit log</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/settings/reports')}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}
              >
                <Link size={20} color="#ef4444" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                  Звіти
                </Text>
                <Text style={tw`text-sm text-gray-600`}>PDF, CSV</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        <Text style={tw`text-sm font-semibold text-gray-600 mb-2 ml-1`}>
          Конфіденційність
        </Text>

        <Card style={tw`mb-4`}>
          <TouchableOpacity
            onPress={() => Alert.alert('Конфіденційність', 'Налаштування конфіденційності будуть доступні в наступній версії')}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}
              >
                <Shield size={20} color="#ef4444" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900`}>
                  Конфіденційність
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCache}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3`}
            disabled={clearing}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3`}
              >
                <Database size={20} color="#6b7280" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                  Очистити кеш
                </Text>
                <Text style={tw`text-sm text-gray-600`}>
                  Видалити тимчасові файли
                </Text>
              </View>
            </View>
            {clearing ? (
              <Text style={tw`text-sm text-gray-600`}>...</Text>
            ) : (
              <ChevronRight size={20} color="#9ca3af" />
            )}
          </TouchableOpacity>
        </Card>

        <Text style={tw`text-sm font-semibold text-gray-600 mb-2 ml-1`}>Інше</Text>

        <Card style={tw`mb-4`}>
          <TouchableOpacity
            onPress={() => router.push('/settings/about')}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3 border-b border-gray-100`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
              >
                <Info size={20} color="#0284c7" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900`}>
                  Про додаток
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/settings/help')}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-between py-3`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}
              >
                <HelpCircle size={20} color="#8b5cf6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-gray-900`}>
                  Допомога та підтримка
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        <Card style={tw`mb-4`}>
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.7}
            style={tw`flex-row items-center py-2`}
          >
            <View
              style={tw`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}
            >
              <LogOut size={20} color="#ef4444" />
            </View>
            <Text style={tw`text-base font-medium text-red-600`}>Вийти з акаунту</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={tw`text-sm text-gray-600 text-center`}>
            AGENT CRM v1.0.0
          </Text>
          <Text style={tw`text-xs text-gray-400 text-center mt-1`}>
            © 2025 AGENT. Всі права захищені.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
