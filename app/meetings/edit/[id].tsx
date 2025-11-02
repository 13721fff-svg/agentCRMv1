import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, MapPin, FileText, Map as MapIcon } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import DateTimePickerComponent from '@/components/DateTimePicker';
import ParticipantsSelector from '@/components/ParticipantsSelector';
import ClientSelector from '@/components/ClientSelector';
import { useMeetingsStore } from '@/store/meetingsStore';
import { supabase } from '@/lib/supabase';

export default function EditMeetingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const updateMeeting = useMeetingsStore((state) => state.updateMeeting);

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [participants, setParticipants] = useState<string[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMeeting(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setLocation(data.location || '');
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setStartTime(new Date(data.start_time));
        setEndTime(new Date(data.end_time));
        setParticipants(data.participants || []);
        setClientId(data.client_id);
      }
    } catch (error) {
      console.error('Error loading meeting:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити зустріч');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Помилка', "Назва зустрічі обов'язкова");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Помилка', 'Час початку має бути раніше часу закінчення');
      return;
    }

    try {
      setSaving(true);

      const updates: Partial<any> = {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        latitude,
        longitude,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        participants,
        client_id: clientId,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      updateMeeting(id, updates);

      Alert.alert('Успіх', 'Зустріч оновлено!', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating meeting:', error);
      Alert.alert('Помилка', 'Не вдалося оновити зустріч');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-white`}>
        <Header title="Редагувати зустріч" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={tw`flex-1 bg-white`}>
        <Header title="Редагувати зустріч" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-gray-500`}>Зустріч не знайдено</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Редагувати зустріч" showBack />

      <ScrollView contentContainerStyle={tw`p-4 pb-24`}>
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
          onChange={setStartTime}
          mode="datetime"
          minimumDate={new Date()}
        />

        <DateTimePickerComponent
          label="Дата та час закінчення *"
          value={endTime}
          onChange={setEndTime}
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

        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
            Локація
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/map/picker?returnTo=/meetings/edit/${id}`)}
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
          title={saving ? 'Збереження...' : 'Зберегти зміни'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
