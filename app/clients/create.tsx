import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, MapPin } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function CreateClientScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName) {
      alert('Ім\'я обов\'язкове');
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
      <Header title={t('clients.addClient')} showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Input
          label={t('clients.name')}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Іван Іваненко"
          icon={<User size={20} color="#737373" />}
        />

        <Input
          label={t('clients.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          icon={<Mail size={20} color="#737373" />}
        />

        <Input
          label={t('clients.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder="+380 XX XXX XX XX"
          keyboardType="phone-pad"
          icon={<Phone size={20} color="#737373" />}
        />

        <Input
          label={t('clients.address')}
          value={address}
          onChangeText={setAddress}
          placeholder="м. Київ, вул. Хрещатик 1"
          icon={<MapPin size={20} color="#737373" />}
        />

        <Input
          label={t('clients.notes')}
          value={notes}
          onChangeText={setNotes}
          placeholder="Додаткова інформація"
          multiline
          numberOfLines={4}
        />

        <Button
          title={t('common.save')}
          onPress={handleSave}
          loading={loading}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
