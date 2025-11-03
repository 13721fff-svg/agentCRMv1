import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Megaphone, Mail, MessageSquare, Image as ImageIcon } from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import DateTimePicker from '@/components/DateTimePicker';
import { useAuthStore } from '@/store/authStore';
import { useCampaignsStore } from '@/store/campaignsStore';
import { useClientsStore } from '@/store/clientsStore';
import { supabase } from '@/lib/supabase';

export default function NewCampaignScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const user = useAuthStore((state) => state.user);
  const { addCampaign } = useCampaignsStore();
  const { clients } = useClientsStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'push' | 'email' | 'sms' | 'banner'>('push');
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [targetAudience, setTargetAudience] = useState<'all' | 'specific'>('all');
  const [saving, setSaving] = useState(false);

  const campaignTypes = [
    { id: 'push', label: 'Push-повідомлення', icon: Megaphone, color: '#8b5cf6' },
    { id: 'email', label: 'Email розсилка', icon: Mail, color: '#0284c7' },
    { id: 'sms', label: 'SMS розсилка', icon: MessageSquare, color: '#16a34a' },
    { id: 'banner', label: 'Банер', icon: ImageIcon, color: '#f59e0b' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Помилка', 'Введіть назву кампанії');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Помилка', 'Введіть контент кампанії');
      return;
    }

    if (!user?.org_id || !user?.id) return;

    try {
      setSaving(true);

      const campaignData = {
        org_id: user.org_id,
        title,
        description: description || null,
        type,
        status: 'draft' as const,
        target_audience: {
          type: targetAudience,
          count: targetAudience === 'all' ? clients.length : 0,
        },
        start_date: startDate?.toISOString() || null,
        end_date: endDate?.toISOString() || null,
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          views: 0,
        },
        content,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) throw error;

      addCampaign(data);
      Alert.alert('Успіх', 'Кампанію створено', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating campaign:', error);
      Alert.alert('Помилка', 'Не вдалося створити кампанію');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header title="Нова кампанія" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Основна інформація
          </Text>

          <Input
            label="Назва кампанії *"
            value={title}
            onChangeText={setTitle}
            placeholder="Наприклад, Літня акція 2025"
          />

          <Input
            label="Опис"
            value={description}
            onChangeText={setDescription}
            placeholder="Короткий опис кампанії"
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Тип кампанії *
          </Text>

          <View style={tw`flex-row flex-wrap gap-2`}>
            {campaignTypes.map((campaignType) => {
              const Icon = campaignType.icon;
              const isSelected = type === campaignType.id;

              return (
                <TouchableOpacity
                  key={campaignType.id}
                  onPress={() => setType(campaignType.id as any)}
                  style={tw`flex-1 min-w-36`}
                >
                  <Card
                    style={tw`border-2 ${
                      isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <View style={tw`items-center py-3`}>
                      <View
                        style={tw.style(
                          'w-12 h-12 rounded-full items-center justify-center mb-2',
                          { backgroundColor: campaignType.color + '20' }
                        )}
                      >
                        <Icon size={24} color={campaignType.color} />
                      </View>
                      <Text
                        style={tw`text-sm font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-700'
                        } text-center`}
                      >
                        {campaignType.label}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Контент *
          </Text>

          <Input
            label={
              type === 'email'
                ? 'Текст email'
                : type === 'sms'
                ? 'Текст SMS'
                : type === 'banner'
                ? 'Текст банера'
                : 'Текст повідомлення'
            }
            value={content}
            onChangeText={setContent}
            placeholder={`Введіть ${
              type === 'email'
                ? 'текст email'
                : type === 'sms'
                ? 'текст SMS'
                : type === 'banner'
                ? 'текст банера'
                : 'текст push-повідомлення'
            }`}
            multiline
            numberOfLines={5}
          />

          <Text style={tw`text-xs text-gray-500 mt-1`}>
            {content.length} символів
            {type === 'sms' && ` (макс. 160)`}
          </Text>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Цільова аудиторія
          </Text>

          <View style={tw`flex-row gap-2 mb-3`}>
            <TouchableOpacity
              onPress={() => setTargetAudience('all')}
              style={tw`flex-1`}
            >
              <Card
                style={tw`border-2 ${
                  targetAudience === 'all'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <Text
                  style={tw`text-sm font-medium ${
                    targetAudience === 'all' ? 'text-blue-900' : 'text-gray-700'
                  } text-center py-2`}
                >
                  Всі клієнти ({clients.length})
                </Text>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTargetAudience('specific')}
              style={tw`flex-1`}
            >
              <Card
                style={tw`border-2 ${
                  targetAudience === 'specific'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <Text
                  style={tw`text-sm font-medium ${
                    targetAudience === 'specific'
                      ? 'text-blue-900'
                      : 'text-gray-700'
                  } text-center py-2`}
                >
                  Вибірково
                </Text>
              </Card>
            </TouchableOpacity>
          </View>

          {targetAudience === 'specific' && (
            <View style={tw`bg-yellow-50 border border-yellow-200 rounded-lg p-3`}>
              <Text style={tw`text-xs text-yellow-800`}>
                Вибір конкретних клієнтів буде доступний після створення кампанії
              </Text>
            </View>
          )}
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Розклад
          </Text>

          <DateTimePicker
            label="Дата початку"
            value={startDate}
            onChange={setStartDate}
            placeholder="Виберіть дату початку"
          />

          <DateTimePicker
            label="Дата завершення"
            value={endDate}
            onChange={setEndDate}
            placeholder="Виберіть дату завершення"
            minimumDate={startDate ?? undefined}
          />

          <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3`}>
            <Text style={tw`text-xs text-blue-800`}>
              Якщо не вказати дати, кампанія буде збережена як чернетка і може бути
              запущена вручну
            </Text>
          </View>
        </Card>

        <Button
          title="Створити кампанію"
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}
