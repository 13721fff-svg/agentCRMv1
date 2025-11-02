import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Download, Share2, Mail, Phone, Globe } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';

export default function QRBusinessCardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [qrSize] = useState(200);

  if (!user) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="QR-візитка" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-gray-600`}>Завантаження...</Text>
        </View>
      </View>
    );
  }

  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${user.full_name}
EMAIL:${user.email}
${user.phone ? `TEL:${user.phone}` : ''}
TITLE:${user.role}
END:VCARD`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Візитка ${user.full_name}\n\nEmail: ${user.email}${
          user.phone ? `\nТелефон: ${user.phone}` : ''
        }`,
        title: 'Моя візитка',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Завантажити QR-код',
      'Функція завантаження буде доступна в наступній версії'
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="QR-візитка" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4 items-center`}>
          <Text style={tw`text-xl font-bold text-gray-900 mb-2 text-center`}>
            {user.full_name}
          </Text>
          <Text style={tw`text-sm text-gray-600 mb-6 text-center`}>
            Поділіться своїми контактами
          </Text>

          <View style={tw`bg-white p-6 rounded-2xl shadow-sm mb-6`}>
            <QRCode value={vCardData} size={qrSize} />
          </View>

          <Text style={tw`text-xs text-gray-500 text-center mb-4`}>
            Скануйте QR-код для збереження контакту
          </Text>

          <View style={tw`flex-row gap-3 w-full`}>
            <View style={tw`flex-1`}>
              <Button
                title="Поділитися"
                onPress={handleShare}
                variant="outline"
                fullWidth
              />
            </View>
            <View style={tw`flex-1`}>
              <Button
                title="Завантажити"
                onPress={handleDownload}
                variant="outline"
                fullWidth
              />
            </View>
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-4`}>
            Контактна інформація
          </Text>

          <View style={tw`space-y-3`}>
            <View style={tw`flex-row items-center py-2 border-b border-gray-100`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
              >
                <Mail size={18} color="#0284c7" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-gray-600 mb-1`}>Email</Text>
                <Text style={tw`text-sm text-gray-900`}>{user.email}</Text>
              </View>
            </View>

            {user.phone && (
              <View style={tw`flex-row items-center py-2 border-b border-gray-100`}>
                <View
                  style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}
                >
                  <Phone size={18} color="#16a34a" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs text-gray-600 mb-1`}>Телефон</Text>
                  <Text style={tw`text-sm text-gray-900`}>{user.phone}</Text>
                </View>
              </View>
            )}

            <View style={tw`flex-row items-center py-2`}>
              <View
                style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}
              >
                <Globe size={18} color="#8b5cf6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-gray-600 mb-1`}>Роль</Text>
                <Text style={tw`text-sm text-gray-900 capitalize`}>{user.role}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={tw`text-base font-semibold text-gray-900 mb-2`}>
            Як використовувати
          </Text>
          <View style={tw`space-y-2`}>
            <View style={tw`flex-row items-start`}>
              <View style={tw`w-6 h-6 rounded-full bg-blue-600 items-center justify-center mr-2 mt-0.5`}>
                <Text style={tw`text-xs font-bold text-white`}>1</Text>
              </View>
              <Text style={tw`flex-1 text-sm text-gray-700`}>
                Покажіть QR-код клієнту або партнеру
              </Text>
            </View>
            <View style={tw`flex-row items-start`}>
              <View style={tw`w-6 h-6 rounded-full bg-blue-600 items-center justify-center mr-2 mt-0.5`}>
                <Text style={tw`text-xs font-bold text-white`}>2</Text>
              </View>
              <Text style={tw`flex-1 text-sm text-gray-700`}>
                Вони сканують код своєю камерою
              </Text>
            </View>
            <View style={tw`flex-row items-start`}>
              <View style={tw`w-6 h-6 rounded-full bg-blue-600 items-center justify-center mr-2 mt-0.5`}>
                <Text style={tw`text-xs font-bold text-white`}>3</Text>
              </View>
              <Text style={tw`flex-1 text-sm text-gray-700`}>
                Ваші контакти автоматично зберігаються
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
