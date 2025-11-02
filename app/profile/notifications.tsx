import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  Bell,
  BellOff,
  Mail,
  Calendar,
  ShoppingBag,
  Users,
  Megaphone,
  MessageSquare,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  enabled: boolean;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'orders',
      label: 'Замовлення',
      description: 'Нові замовлення та зміни статусу',
      icon: ShoppingBag,
      color: '#0284c7',
      enabled: true,
    },
    {
      id: 'clients',
      label: 'Клієнти',
      description: 'Нові клієнти та повідомлення',
      icon: Users,
      color: '#8b5cf6',
      enabled: true,
    },
    {
      id: 'meetings',
      label: 'Зустрічі',
      description: 'Нагадування про зустрічі',
      icon: Calendar,
      color: '#16a34a',
      enabled: true,
    },
    {
      id: 'campaigns',
      label: 'Кампанії',
      description: 'Статистика та результати кампаній',
      icon: Megaphone,
      color: '#f59e0b',
      enabled: true,
    },
    {
      id: 'messages',
      label: 'Повідомлення',
      description: 'Нові повідомлення від команди',
      icon: MessageSquare,
      color: '#3b82f6',
      enabled: false,
    },
    {
      id: 'email',
      label: 'Email сповіщення',
      description: 'Отримувати сповіщення на email',
      icon: Mail,
      color: '#6b7280',
      enabled: true,
    },
  ]);

  useEffect(() => {
    checkNotificationPermissions();
    loadSettings();
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPushEnabled(status === 'granted');
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('notifications')
        .eq('user_id', user.id)
        .single();

      if (data && data.notifications) {
        setSettings((prev) =>
          prev.map((setting) => ({
            ...setting,
            enabled: data.notifications[setting.id] ?? setting.enabled,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (updatedSettings: NotificationSetting[]) => {
    if (!user) return;

    try {
      const notificationsData = updatedSettings.reduce(
        (acc, setting) => ({
          ...acc,
          [setting.id]: setting.enabled,
        }),
        {}
      );

      const { error } = await supabase.from('user_settings').upsert({
        user_id: user.id,
        notifications: notificationsData,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти налаштування');
    }
  };

  const handleTogglePush = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Недоступно',
        'Push-сповіщення не підтримуються на веб-платформі'
      );
      return;
    }

    if (!pushEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        setPushEnabled(true);

        const token = (await Notifications.getExpoPushTokenAsync()).data;

        await supabase.from('users').update({
          push_token: token,
          updated_at: new Date().toISOString(),
        }).eq('id', user?.id);

        Alert.alert('Успіх', 'Push-сповіщення увімкнено');
      } else {
        Alert.alert(
          'Помилка',
          'Дозвіл на сповіщення відхилено. Увімкніть в налаштуваннях пристрою.'
        );
      }
    } else {
      setPushEnabled(false);

      await supabase.from('users').update({
        push_token: null,
        updated_at: new Date().toISOString(),
      }).eq('id', user?.id);

      Alert.alert('Інформація', 'Push-сповіщення вимкнено');
    }
  };

  const handleToggleSetting = (id: string) => {
    const updatedSettings = settings.map((setting) =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const handleTestNotification = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Недоступно', 'Тестові сповіщення не підтримуються на веб-платформі');
      return;
    }

    if (!pushEnabled) {
      Alert.alert('Помилка', 'Спочатку увімкніть push-сповіщення');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Тестове сповіщення 📬',
        body: 'Це тестове повідомлення від AGENT CRM',
        data: { type: 'test' },
      },
      trigger: { seconds: 1, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
    });

    Alert.alert('Успіх', 'Тестове сповіщення відправлено');
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Сповіщення" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                Push-сповіщення
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Отримувати сповіщення на пристрій
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: '#d1d5db', true: '#0284c7' }}
              thumbColor="#fff"
              disabled={loading}
            />
          </View>

          {pushEnabled && Platform.OS !== 'web' && (
            <View style={tw`mt-3 pt-3 border-t border-gray-100`}>
              <Button
                title="Відправити тестове сповіщення"
                onPress={handleTestNotification}
                variant="outline"
                size="sm"
                fullWidth
              />
            </View>
          )}
        </Card>

        <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
          Типи сповіщень
        </Text>

        {settings.map((setting) => (
          <Card key={setting.id} style={tw`mb-3`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center flex-1`}>
                <View
                  style={[
                    tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
                    { backgroundColor: `${setting.color}20` },
                  ]}
                >
                  {React.createElement(setting.icon, {
                    size: 20,
                    color: setting.color,
                  })}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                    {setting.label}
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>{setting.description}</Text>
                </View>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => handleToggleSetting(setting.id)}
                trackColor={{ false: '#d1d5db', true: setting.color }}
                thumbColor="#fff"
              />
            </View>
          </Card>
        ))}

        <Card style={tw`mt-4`}>
          <View style={tw`flex-row items-start`}>
            <View
              style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
            >
              <Bell size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Про сповіщення
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Ви можете налаштувати які типи сповіщень отримувати. Важливі системні
                повідомлення будуть приходити завжди.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
