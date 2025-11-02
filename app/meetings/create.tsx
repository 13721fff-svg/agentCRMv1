import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, FileText } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function CreateMeetingScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title) {
      alert('Назва зустрічі обов\'язкова');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Створити зустріч" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Input
          label="Назва"
          value={title}
          onChangeText={setTitle}
          placeholder="Зустріч з клієнтом"
          icon={<Calendar size={20} color="#737373" />}
        />

        <Input
          label="Локація"
          value={location}
          onChangeText={setLocation}
          placeholder="Офіс або адреса"
          icon={<MapPin size={20} color="#737373" />}
        />

        <Input
          label="Нотатки"
          value={notes}
          onChangeText={setNotes}
          placeholder="Додаткова інформація"
          multiline
          numberOfLines={4}
          icon={<FileText size={20} color="#737373" />}
        />

        <Button
          title="Зберегти"
          onPress={handleSave}
          loading={loading}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
