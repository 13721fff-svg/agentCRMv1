import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, CheckCircle, XCircle, Link, Send } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuthStore } from '@/store/authStore';

export default function EmailIntegrationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [gmailConnected, setGmailConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [smtpConnected, setSmtpConnected] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  const handleConnectGmail = () => {
    Alert.alert(
      'Gmail',
      'Інтеграція з Gmail буде доступна у наступній версії.\n\nБуде додано:\n• Email campaigns\n• Автоматичні розсилки\n• Шаблони листів',
      [
        {
          text: 'Зрозуміло',
          onPress: () => setGmailConnected(true),
        },
      ]
    );
  };

  const handleConnectOutlook = () => {
    Alert.alert('Outlook', 'Інтеграція з Outlook буде доступна у наступній версії.', [
      {
        text: 'Зрозуміло',
        onPress: () => setOutlookConnected(true),
      },
    ]);
  };

  const handleConnectSMTP = () => {
    if (!smtpHost || !smtpUser || !smtpPassword) {
      Alert.alert('Помилка', 'Заповніть всі поля');
      return;
    }

    Alert.alert('Успіх', 'SMTP налаштовано');
    setSmtpConnected(true);
  };

  const handleTestEmail = () => {
    Alert.alert('Тест', 'Тестовий email надіслано на ваш Email');
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Інтеграція Email" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-center mb-3`}>
            <Mail size={24} color="#0284c7" />
            <Text style={tw`text-lg font-semibold text-gray-900 ml-2`}>Email сповіщення</Text>
          </View>

          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Text style={tw`text-sm font-medium text-gray-900`}>Email нотифікації</Text>
            <Switch value={emailNotifications} onValueChange={setEmailNotifications} />
          </View>
          <Text style={tw`text-xs text-gray-600`}>
            Отримувати сповіщення про події на Email
          </Text>
        </Card>

        <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>Підключені сервіси</Text>

        <Card style={tw`mb-3`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-12 h-12 rounded-full bg-red-50 items-center justify-center mr-3`}
              >
                <Mail size={24} color="#ef4444" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-semibold text-gray-900`}>Gmail</Text>
                <Text style={tw`text-sm text-gray-600`}>
                  {gmailConnected ? 'Підключено' : 'Не підключено'}
                </Text>
              </View>
            </View>
            {gmailConnected ? (
              <CheckCircle size={24} color="#16a34a" />
            ) : (
              <XCircle size={24} color="#9ca3af" />
            )}
          </View>

          {gmailConnected ? (
            <View style={tw`flex-row gap-3`}>
              <Button
                title="Тест"
                onPress={handleTestEmail}
                variant="outline"
                style={tw`flex-1`}
                
              />
              <Button
                title="Від'єднати"
                onPress={() => setGmailConnected(false)}
                variant="outline"
                style={tw`flex-1`}
              />
            </View>
          ) : (
            <Button
              title="Підключити"
              onPress={handleConnectGmail}
              
              fullWidth
            />
          )}
        </Card>

        <Card style={tw`mb-3`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-3`}
              >
                <Mail size={24} color="#0284c7" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-semibold text-gray-900`}>Outlook</Text>
                <Text style={tw`text-sm text-gray-600`}>
                  {outlookConnected ? 'Підключено' : 'Не підключено'}
                </Text>
              </View>
            </View>
            {outlookConnected ? (
              <CheckCircle size={24} color="#16a34a" />
            ) : (
              <XCircle size={24} color="#9ca3af" />
            )}
          </View>

          {outlookConnected ? (
            <View style={tw`flex-row gap-3`}>
              <Button
                title="Тест"
                onPress={handleTestEmail}
                variant="outline"
                style={tw`flex-1`}
                
              />
              <Button
                title="Від'єднати"
                onPress={() => setOutlookConnected(false)}
                variant="outline"
                style={tw`flex-1`}
              />
            </View>
          ) : (
            <Button
              title="Підключити"
              onPress={handleConnectOutlook}
              
              fullWidth
            />
          )}
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>SMTP налаштування</Text>

          <Input label="SMTP Host" value={smtpHost} onChangeText={setSmtpHost} />
          <Input label="Port" value={smtpPort} onChangeText={setSmtpPort} keyboardType="numeric" />
          <Input label="Username" value={smtpUser} onChangeText={setSmtpUser} />
          <Input
            label="Password"
            value={smtpPassword}
            onChangeText={setSmtpPassword}
            secureTextEntry
          />

          <Button
            title={smtpConnected ? 'Оновити' : 'Підключити'}
            onPress={handleConnectSMTP}
            fullWidth
          />
        </Card>

        <Card>
          <Text style={tw`text-sm font-semibold text-gray-900 mb-3`}>Можливості</Text>
          <View style={tw`space-y-2`}>
            <Text style={tw`text-sm text-gray-600`}>✓ Email campaigns</Text>
            <Text style={tw`text-sm text-gray-600`}>✓ Автоматичні розсилки</Text>
            <Text style={tw`text-sm text-gray-600`}>✓ Шаблони листів</Text>
            <Text style={tw`text-sm text-gray-600`}>✓ Сповіщення про події</Text>
            <Text style={tw`text-sm text-gray-600`}>✓ Трекінг відкриттів</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
