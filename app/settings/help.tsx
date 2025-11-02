import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import {
  MessageCircle,
  Mail,
  Phone,
  Book,
  Video,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'Як додати нового клієнта?',
    answer:
      'Перейдіть в розділ "Клієнти" та натисніть на кнопку "+". Заповніть необхідні поля та збережіть. Ви також можете додати клієнта з карти, натиснувши на потрібне місце.',
  },
  {
    question: 'Як створити замовлення?',
    answer:
      'У розділі "Замовлення" натисніть "+", оберіть клієнта, заповніть деталі замовлення (назва, сума, статус, термін) та збережіть. Замовлення також можна створити з профілю клієнта.',
  },
  {
    question: 'Як налаштувати сповіщення?',
    answer:
      'Перейдіть в Профіль → Сповіщення. Увімкніть push-сповіщення та оберіть типи сповіщень, які хочете отримувати (замовлення, клієнти, зустрічі, кампанії).',
  },
  {
    question: 'Як запланувати зустріч?',
    answer:
      'У розділі "Календар" (іконка календаря) натисніть на потрібну дату або кнопку "+". Вкажіть назву, клієнта, час та локацію. Ви отримаєте нагадування перед зустріччю.',
  },
  {
    question: 'Як змінити мову додатку?',
    answer:
      'Зайдіть в Налаштування → Мова. Оберіть Українську або English. Мова змінюється миттєво для всього додатку.',
  },
  {
    question: 'Як працює QR-візитка?',
    answer:
      'Перейдіть в Профіль → QR-візитка. Покажіть QR-код клієнту для сканування. Ваші контакти (ім\'я, email, телефон) автоматично збережуться в їхньому телефоні.',
  },
  {
    question: 'Як змінити тариф?',
    answer:
      'Зайдіть в Профіль → Підписка і тариф. Оберіть потрібний план та натисніть "Обрати тариф". Для платних тарифів буде доступна оплата.',
  },
  {
    question: 'Як очистити кеш?',
    answer:
      'Перейдіть в Налаштування → Очистити кеш. Підтвердіть дію. Це видалить тимчасові файли та може звільнити місце на пристрої.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Error opening link:', err)
    );
  };

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Допомога та підтримка" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Як ми можемо допомогти?
          </Text>

          <TouchableOpacity
            onPress={() => handleOpenLink('mailto:support@agent-crm.com')}
            style={tw`flex-row items-center p-3 bg-blue-50 rounded-lg mb-3`}
          >
            <View
              style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
            >
              <Mail size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Написати в підтримку
              </Text>
              <Text style={tw`text-xs text-gray-600`}>
                support@agent-crm.com
              </Text>
            </View>
            <ExternalLink size={16} color="#0284c7" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenLink('https://t.me/agent_crm_support')}
            style={tw`flex-row items-center p-3 bg-blue-50 rounded-lg mb-3`}
          >
            <View
              style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
            >
              <MessageCircle size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Telegram підтримка
              </Text>
              <Text style={tw`text-xs text-gray-600`}>
                Пн-Пт 9:00-18:00
              </Text>
            </View>
            <ExternalLink size={16} color="#0284c7" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenLink('tel:+380442345678')}
            style={tw`flex-row items-center p-3 bg-green-50 rounded-lg`}
          >
            <View
              style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}
            >
              <Phone size={20} color="#16a34a" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Гаряча лінія
              </Text>
              <Text style={tw`text-xs text-gray-600`}>
                +38 (044) 234-56-78
              </Text>
            </View>
            <ExternalLink size={16} color="#16a34a" />
          </TouchableOpacity>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Корисні ресурси
          </Text>

          <TouchableOpacity
            onPress={() => handleOpenLink('https://agent-crm.com/docs')}
            style={tw`flex-row items-center py-3 border-b border-gray-100`}
          >
            <Book size={20} color="#6b7280" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900`}>
                Документація
              </Text>
              <Text style={tw`text-xs text-gray-600`}>
                Детальні інструкції та гайди
              </Text>
            </View>
            <ExternalLink size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenLink('https://youtube.com/@agent-crm')}
            style={tw`flex-row items-center py-3`}
          >
            <Video size={20} color="#6b7280" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900`}>
                Відео-уроки
              </Text>
              <Text style={tw`text-xs text-gray-600`}>
                YouTube канал з туторіалами
              </Text>
            </View>
            <ExternalLink size={16} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>
          Часті запитання
        </Text>

        {FAQS.map((faq, index) => (
          <Card key={index} style={tw`mb-3`}>
            <TouchableOpacity
              onPress={() => toggleFAQ(index)}
              style={tw`flex-row items-start justify-between`}
            >
              <View style={tw`flex-1 pr-3`}>
                <Text style={tw`text-sm font-medium text-gray-900`}>
                  {faq.question}
                </Text>
                {expandedIndex === index && (
                  <Text style={tw`text-sm text-gray-600 mt-2 leading-5`}>
                    {faq.answer}
                  </Text>
                )}
              </View>
              {expandedIndex === index ? (
                <ChevronUp size={20} color="#6b7280" />
              ) : (
                <ChevronDown size={20} color="#6b7280" />
              )}
            </TouchableOpacity>
          </Card>
        ))}

        <Card style={tw`bg-blue-50 border-0`}>
          <View style={tw`flex-row items-start`}>
            <View
              style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
            >
              <HelpCircle size={20} color="#0284c7" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Не знайшли відповідь?
              </Text>
              <Text style={tw`text-sm text-gray-600 mb-3`}>
                Зв'яжіться з нашою командою підтримки через email або Telegram
              </Text>
              <Button
                title="Написати в підтримку"
                onPress={() => handleOpenLink('mailto:support@agent-crm.com')}
                size="sm"
              />
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
