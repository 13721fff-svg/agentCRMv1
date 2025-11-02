import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Smartphone,
  Globe,
  Mail,
  Github,
  Twitter,
  FileText,
  Shield,
  Award,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';

export default function AboutScreen() {
  const router = useRouter();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Error opening link:', err)
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Про додаток" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4 items-center`}>
          <View
            style={tw`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center mb-4`}
          >
            <Smartphone size={40} color="#fff" />
          </View>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
            AGENT CRM
          </Text>
          <Text style={tw`text-base text-gray-600 mb-1`}>Версія 1.0.0</Text>
          <Text style={tw`text-sm text-gray-500 text-center`}>
            Build 100 (2025)
          </Text>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Про AGENT CRM
          </Text>
          <Text style={tw`text-sm text-gray-700 leading-6 mb-3`}>
            AGENT CRM — це комплексна система управління взаємовідносинами з
            клієнтами, розроблена спеціально для українського ринку.
          </Text>
          <Text style={tw`text-sm text-gray-700 leading-6`}>
            Наша місія — надати малому та середньому бізнесу інструменти для
            ефективного управління клієнтами, замовленнями та аналітикою.
          </Text>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Можливості
          </Text>
          <View style={tw`space-y-3`}>
            <View style={tw`flex-row items-start`}>
              <View
                style={tw`w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3 mt-0.5`}
              >
                <Award size={16} color="#0284c7" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                  Управління клієнтами
                </Text>
                <Text style={tw`text-sm text-gray-600`}>
                  База клієнтів, історія взаємодій, карта розташування
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-start`}>
              <View
                style={tw`w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3 mt-0.5`}
              >
                <Award size={16} color="#16a34a" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                  Замовлення та зустрічі
                </Text>
                <Text style={tw`text-sm text-gray-600`}>
                  Відстеження замовлень, планування зустрічей, нагадування
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-start`}>
              <View
                style={tw`w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3 mt-0.5`}
              >
                <Award size={16} color="#8b5cf6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                  Аналітика
                </Text>
                <Text style={tw`text-sm text-gray-600`}>
                  Звіти, графіки, KPI, прогнозування
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-start`}>
              <View
                style={tw`w-8 h-8 rounded-full bg-yellow-100 items-center justify-center mr-3 mt-0.5`}
              >
                <Award size={16} color="#f59e0b" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                  Маркетинг
                </Text>
                <Text style={tw`text-sm text-gray-600`}>
                  Кампанії, розсилки, банери, промо-матеріали
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Контакти
          </Text>

          <TouchableOpacity
            onPress={() => handleOpenLink('https://agent-crm.com')}
            style={tw`flex-row items-center py-3 border-b border-gray-100`}
          >
            <View
              style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
            >
              <Globe size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900`}>
                Веб-сайт
              </Text>
              <Text style={tw`text-sm text-blue-600`}>agent-crm.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenLink('mailto:support@agent-crm.com')}
            style={tw`flex-row items-center py-3 border-b border-gray-100`}
          >
            <View
              style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}
            >
              <Mail size={20} color="#16a34a" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900`}>Email</Text>
              <Text style={tw`text-sm text-blue-600`}>
                support@agent-crm.com
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenLink('https://github.com/agent-crm')}
            style={tw`flex-row items-center py-3 border-b border-gray-100`}
          >
            <View
              style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3`}
            >
              <Github size={20} color="#6b7280" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900`}>GitHub</Text>
              <Text style={tw`text-sm text-blue-600`}>github.com/agent-crm</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenLink('https://twitter.com/agent_crm')}
            style={tw`flex-row items-center py-3`}
          >
            <View
              style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
            >
              <Twitter size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900`}>Twitter</Text>
              <Text style={tw`text-sm text-blue-600`}>@agent_crm</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Правова інформація
          </Text>

          <TouchableOpacity
            onPress={() => handleOpenLink('https://agent-crm.com/terms')}
            style={tw`flex-row items-center py-3 border-b border-gray-100`}
          >
            <FileText size={18} color="#6b7280" style={tw`mr-3`} />
            <Text style={tw`text-sm text-gray-900`}>Умови використання</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenLink('https://agent-crm.com/privacy')}
            style={tw`flex-row items-center py-3`}
          >
            <Shield size={18} color="#6b7280" style={tw`mr-3`} />
            <Text style={tw`text-sm text-gray-900`}>
              Політика конфіденційності
            </Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={tw`text-xs text-gray-500 text-center leading-5`}>
            © 2025 AGENT CRM. Всі права захищені.{'\n'}
            Made with ❤️ in Ukraine
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
