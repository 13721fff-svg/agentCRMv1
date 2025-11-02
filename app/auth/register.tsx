import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User } from 'lucide-react-native';
import tw from '@/lib/tw';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { authService } from '@/services/authService';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      setError('Всі поля обов\'язкові');
      return;
    }

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (password.length < 6) {
      setError('Пароль повинен містити мінімум 6 символів');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.signUp(email, password, fullName, 'citizen');
      router.replace('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Помилка реєстрації');
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
            {t('auth.register')}
          </Text>

          <Input
            label={t('auth.fullName')}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Іван Іваненко"
            icon={<User size={20} color="#737373" />}
          />

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

          <Input
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            icon={<Lock size={20} color="#737373" />}
          />

          {error ? (
            <Text style={tw`text-error-500 mb-4`}>{error}</Text>
          ) : null}

          <Button
            title={t('auth.signUp')}
            onPress={handleRegister}
            loading={loading}
            fullWidth
          />
        </View>

        <View style={tw`flex-row items-center justify-center`}>
          <Text style={tw`text-neutral-600 mr-2`}>
            {t('auth.alreadyHaveAccount')}
          </Text>
          <Button
            title={t('auth.login')}
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
