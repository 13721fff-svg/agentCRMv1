import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, MapPin, FileText, Map as MapIcon, Users } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import DateTimePickerComponent from '@/components/DateTimePicker';
import ParticipantsSelector from '@/components/ParticipantsSelector';
import ClientSelector from '@/components/ClientSelector';
import RecurrenceSelector from '@/components/RecurrenceSelector';
import { useMeetingsStore } from '@/store/meetingsStore';
import { RecurrenceFrequency } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/services/notificationService';
import { generateRecurringInstances, checkMeetingConflict, getReminderLabel } from '@/lib/recurringUtils';

export default function CreateMeetingScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const addMeeting = useMeetingsStore((state) => state.addMeeting);
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    address?: string;
    clientId?: string;
    orderId?: string;
    clientName?: string;
    orderTitle?: string;
  }>();

  const [title, setTitle] = useState(params.orderTitle ? `Зустріч: ${params.orderTitle}` : '');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [participants, setParticipants] = useState<string[]>([]);
  const [clientId, setClientId] = useState<string | null>(params.clientId || null);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.latitude && params.longitude) {
      setLatitude(parseFloat(params.latitude));
      setLongitude(parseFloat(params.longitude));
      if (params.address) {
        setLocation(params.address);
      }
    }
    if (params.clientId) {
      setClientId(params.clientId);
    }
  }, [params]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Помилка', "Назва зустрічі обов'язкова");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Помилка', 'Час початку має бути раніше часу закінчення');
      return;
    }

    if (recurrenceFrequency !== 'none' && !recurrenceEndDate) {
      Alert.alert('Помилка', 'Вкажіть дату закінчення повторення');
      return;
    }

    try {
      setLoading(true);

      const { data: existingMeetings } = await supabase
        .from('meetings')
        .select('id, start_time, end_time, title')
        .eq('org_id', user?.org_id)
        .eq('status', 'scheduled')
        .or(`start_time.gte.${startTime.toISOString()},start_time.lte.${endTime.toISOString()}`);

      const conflict = checkMeetingConflict(startTime, endTime, existingMeetings || []);
      if (conflict.hasConflict && conflict.conflictingMeeting) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          Alert.alert(
            '⚠️ Конфлікт часу',
            `Зустріч перетинається з іншою подією:\n"${conflict.conflictingMeeting?.title || 'Зустріч'}"\n\nПродовжити?`,
            [
              { text: 'Скасувати', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Продовжити', onPress: () => resolve(true) },
            ]
          );
        });
        if (!shouldContinue) {
          setLoading(false);
          return;
        }
      }

      const meetingData = {
        org_id: user?.org_id,
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        latitude,
        longitude,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'scheduled',
        participants,
        client_id: clientId,
        created_by: user?.id,
        recurrence_frequency: recurrenceFrequency,
        recurrence_end_date: recurrenceEndDate?.toISOString() || null,
      };

      const { data, error } = await supabase
        .from('meetings')
        .insert([meetingData])
        .select()
        .single();

      if (error) throw error;

      let totalCreated = 1;

      if (recurrenceFrequency !== 'none' && recurrenceEndDate) {
        const instances = generateRecurringInstances(
          { ...meetingData, parent_meeting_id: data.id },
          recurrenceFrequency,
          recurrenceEndDate
        );

        if (instances.length > 0) {
          const instancesWithParent = instances.map((inst) => ({
            ...inst,
            parent_meeting_id: data.id,
          }));

          const { data: createdInstances, error: instancesError } = await supabase
            .from('meetings')
            .insert(instancesWithParent)
            .select();

          if (instancesError) throw instancesError;
          totalCreated += createdInstances?.length || 0;

          if (createdInstances) {
            for (const instance of createdInstances) {
              await notificationService.scheduleMeetingNotification({
                id: instance.id,
                title: instance.title,
                startTime: instance.start_time,
                location: instance.location || undefined,
                minutesBefore: reminderMinutes,
              });
            }
          }
        }
      }

      addMeeting(data);

      await notificationService.scheduleMeetingNotification({
        id: data.id,
        title: data.title,
        startTime: data.start_time,
        location: data.location || undefined,
        minutesBefore: reminderMinutes,
      });

      const message = recurrenceFrequency !== 'none'
        ? `Створено ${totalCreated} зустрічей (${totalCreated - 1} повторень)`
        : 'Зустріч створено!';

      Alert.alert('Успіх', message, [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/meetings');
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating meeting:', error);
      Alert.alert('Помилка', 'Не вдалося створити зустріч');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Створити зустріч" showBack />

      <ScrollView contentContainerStyle={tw`p-4 pb-24`}>
        {params.clientName && (
          <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4`}>
            <Text style={tw`text-sm font-medium text-blue-900`}>
              Зустріч з клієнтом: {params.clientName}
            </Text>
            {params.orderTitle && (
              <Text style={tw`text-xs text-blue-700 mt-1`}>
                Замовлення: {params.orderTitle}
              </Text>
            )}
          </View>
        )}

        <Input
          label="Назва *"
          value={title}
          onChangeText={setTitle}
          placeholder="Зустріч з клієнтом"
          icon={<Calendar size={20} color="#737373" />}
        />

        <Input
          label="Опис"
          value={description}
          onChangeText={setDescription}
          placeholder="Додаткова інформація про зустріч"
          multiline
          numberOfLines={3}
          icon={<FileText size={20} color="#737373" />}
        />

        <DateTimePickerComponent
          label="Дата та час початку *"
          value={startTime}
          onChange={(date) => date && setStartTime(date)}
          mode="datetime"
          minimumDate={new Date()}
        />

        <DateTimePickerComponent
          label="Дата та час закінчення *"
          value={endTime}
          onChange={(date) => date && setEndTime(date)}
          mode="datetime"
          minimumDate={startTime}
        />

        <ClientSelector
          selectedClientId={clientId}
          onClientChange={setClientId}
        />

        <ParticipantsSelector
          selectedParticipants={participants}
          onParticipantsChange={setParticipants}
        />

        <RecurrenceSelector
          recurrenceFrequency={recurrenceFrequency}
          recurrenceEndDate={recurrenceEndDate}
          onRecurrenceChange={setRecurrenceFrequency}
          onEndDateChange={setRecurrenceEndDate}
        />

        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
            Нагадати за
          </Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {[0, 5, 10, 15, 30, 60].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                onPress={() => setReminderMinutes(minutes)}
                style={[
                  tw`px-4 py-2 rounded-lg border`,
                  reminderMinutes === minutes
                    ? tw`bg-blue-600 border-blue-600`
                    : tw`bg-white border-gray-300`,
                ]}
              >
                <Text
                  style={[
                    tw`text-sm font-medium`,
                    reminderMinutes === minutes ? tw`text-white` : tw`text-gray-700`,
                  ]}
                >
                  {getReminderLabel(minutes)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
            Локація
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/map/picker?returnTo=/meetings/create')}
            style={tw`flex-row items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-white`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <MapPin size={20} color="#737373" style={tw`mr-2`} />
              <Text style={tw`text-base ${location ? 'text-gray-900' : 'text-gray-400'}`}>
                {location || 'Оберіть локацію на карті'}
              </Text>
            </View>
            <MapIcon size={20} color="#0284c7" />
          </TouchableOpacity>
          {latitude && longitude && (
            <Text style={tw`text-xs text-gray-500 mt-1`}>
              📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          )}
        </View>

        <View style={tw`p-4 bg-blue-50 rounded-lg mb-4`}>
          <Text style={tw`text-xs text-blue-800`}>
            💡 Тривалість зустрічі:{' '}
            {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} хвилин
          </Text>
        </View>

        <Button
          title={loading ? 'Збереження...' : 'Створити зустріч'}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
