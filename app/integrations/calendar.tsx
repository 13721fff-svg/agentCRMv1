import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, CheckCircle, XCircle, RefreshCw, Link } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';

export default function CalendarIntegrationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleConnectGoogle = () => {
    Alert.alert(
      'Google Calendar',
      'Інтеграція з Google Calendar буде доступна у наступній версії.\n\nБуде додано:\n• Синхронізація зустрічей\n• Автоматичне створення подій\n• Push-нагадування',
      [
        {
          text: 'Зрозуміло',
          onPress: () => setGoogleConnected(true),
        },
      ]
    );
  };

  const handleConnectOutlook = () => {
    Alert.alert(
      'Outlook Calendar',
      'Інтеграція з Outlook Calendar буде доступна у наступній версії.',
      [
        {
          text: 'Зрозуміло',
          onPress: () => setOutlookConnected(true),
        },
      ]
    );
  };

  const handleSync = () => {
    Alert.alert('Синхронізація', 'Зустрічі синхронізовано з календарем');
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Інтеграція календаря" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-center mb-3`}>
            <Calendar size={24} color="#0284c7" />
            <Text style={tw`text-lg font-semibold text-gray-900 ml-2`}>
              Синхронізація календаря
            </Text>
          </View>
          <Text style={tw`text-sm text-gray-600 mb-4`}>
            Підключіть ваш календар для автоматичної синхронізації зустрічей
          </Text>

          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Text style={tw`text-sm font-medium text-gray-900`}>
              Автоматична синхронізація
            </Text>
            <Switch value={autoSync} onValueChange={setAutoSync} />
          </View>
          <Text style={tw`text-xs text-gray-600`}>
            Зустрічі будуть автоматично додаватись в календар
          </Text>
        </Card>

        <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
          Підключені сервіси
        </Text>

        <Card style={tw`mb-3`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-12 h-12 rounded-full bg-red-50 items-center justify-center mr-3`}
              >
                <Calendar size={24} color="#ef4444" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-semibold text-gray-900`}>Google Calendar</Text>
                <Text style={tw`text-sm text-gray-600`}>
                  {googleConnected ? 'Підключено' : 'Не підключено'}
                </Text>
              </View>
            </View>
            {googleConnected ? (
              <CheckCircle size={24} color="#16a34a" />
            ) : (
              <XCircle size={24} color="#9ca3af" />
            )}
          </View>

          {googleConnected ? (
            <View style={tw`flex-row gap-3`}>
              <Button
                title="Синхронізувати"
                onPress={handleSync}
                variant="outline"
                style={tw`flex-1`}
                
              />
              <Button
                title="Від'єднати"
                onPress={() => setGoogleConnected(false)}
                variant="outline"
                style={tw`flex-1`}
              />
            </View>
          ) : (
            <Button
              title="Підключити"
              onPress={handleConnectGoogle}
              
              fullWidth
            />
          )}
        </Card>

        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-3`}
              >
                <Calendar size={24} color="#0284c7" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-semibold text-gray-900`}>
                  Outlook Calendar
                </Text>
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
                title="Синхронізувати"
                onPress={handleSync}
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

        <Card>
          <Text style={tw`text-sm font-semibold text-gray-900 mb-3`}>Можливості</Text>
          <View style={tw`space-y-2`}>
            <Text style={tw`text-sm text-gray-600`}>
              ✓ Автоматичне створення подій при додаванні зустрічі
            </Text>
            <Text style={tw`text-sm text-gray-600`}>
              ✓ Синхронізація в обидва боки
            </Text>
            <Text style={tw`text-sm text-gray-600`}>✓ Push-нагадування</Text>
            <Text style={tw`text-sm text-gray-600`}>
              ✓ Оновлення при зміні зустрічі
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
