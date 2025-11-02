import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react-native';
import tw from '@/lib/tw';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.email') + ' та ' + t('auth.password') + ' обов\'язкові');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      setUser(user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={tw`flex-1 justify-center px-6`}>
        <View style={tw`mb-8`}>
          <Text style={tw`text-4xl font-bold text-neutral-900 mb-2`}>
            {t('app.name')}
          </Text>
          <Text style={tw`text-lg text-neutral-600`}>
            {t('app.tagline')}
          </Text>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-2xl font-bold text-neutral-900 mb-6`}>
            {t('auth.login')}
          </Text>

          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={20} color="#737373" />}
          />

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            icon={<Lock size={20} color="#737373" />}
          />

          {error ? (
            <Text style={tw`text-error-500 mb-4`}>{error}</Text>
          ) : null}

          <Button
            title={t('auth.signIn')}
            onPress={handleLogin}
            loading={loading}
            fullWidth
          />
        </View>

        <View style={tw`flex-row items-center justify-center`}>
          <Text style={tw`text-neutral-600 mr-2`}>
            {t('auth.dontHaveAccount')}
          </Text>
          <Button
            title={t('auth.register')}
            onPress={() => router.push('/auth/register')}
            variant="ghost"
            size="sm"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
