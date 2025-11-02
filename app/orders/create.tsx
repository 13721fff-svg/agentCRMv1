import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FileText, DollarSign, Calendar } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ClientSelector from '@/components/ClientSelector';

export default function CreateOrderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ clientId?: string; clientName?: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [clientId, setClientId] = useState<string | undefined>(params.clientId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.clientId) {
      setClientId(params.clientId);
    }
  }, [params.clientId]);

  const handleSave = async () => {
    if (!title) {
      alert('Назва замовлення обов\'язкова');
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
      <Header title={t('orders.addOrder')} showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        {params.clientName && (
          <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4`}>
            <Text style={tw`text-sm font-medium text-blue-900`}>
              Замовлення для: {params.clientName}
            </Text>
          </View>
        )}

        <ClientSelector
          selectedClientId={clientId || null}
          onClientChange={(id) => setClientId(id || undefined)}
        />

        <Input
          label="Назва"
          value={title}
          onChangeText={setTitle}
          placeholder="Встановлення вікон"
          icon={<FileText size={20} color="#737373" />}
        />

        <Input
          label={t('orders.description')}
          value={description}
          onChangeText={setDescription}
          placeholder="Опис робіт"
          multiline
          numberOfLines={4}
        />

        <Input
          label={t('orders.amount')}
          value={amount}
          onChangeText={setAmount}
          placeholder="5000"
          keyboardType="numeric"
          icon={<DollarSign size={20} color="#737373" />}
        />

        <View style={tw`mb-4`}>
          <Text style={tw`text-neutral-700 font-medium mb-2`}>
            {t('orders.status')}
          </Text>
          <View style={tw`flex-row flex-wrap`}>
            {['draft', 'pending', 'confirmed'].map((status) => (
              <View
                key={status}
                style={tw`bg-neutral-100 px-3 py-2 rounded-lg mr-2 mb-2`}
              >
                <Text style={tw`text-neutral-700`}>
                  {t(`orders.${status}`)}
                </Text>
              </View>
            ))}
          </View>
        </View>

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
