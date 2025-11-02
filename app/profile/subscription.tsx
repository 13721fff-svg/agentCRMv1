import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Crown,
  Check,
  X,
  Users,
  BarChart3,
  Megaphone,
  Shield,
  Zap,
  Award,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: UserRole;
  name: string;
  price: number;
  period: string;
  color: string;
  icon: any;
  features: PlanFeature[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'citizen',
    name: 'Базовий',
    price: 0,
    period: 'місяць',
    color: '#6b7280',
    icon: Users,
    features: [
      { name: 'Перегляд каталогу', included: true },
      { name: 'Створення замовлень', included: true },
      { name: 'Базова підтримка', included: true },
      { name: 'Клієнти', included: false },
      { name: 'Аналітика', included: false },
      { name: 'Кампанії', included: false },
    ],
  },
  {
    id: 'individual',
    name: 'Індивідуальний',
    price: 199,
    period: 'місяць',
    color: '#3b82f6',
    icon: Award,
    features: [
      { name: 'Все з Базового', included: true },
      { name: 'Управління клієнтами', included: true },
      { name: 'Замовлення та зустрічі', included: true },
      { name: 'Базова аналітика', included: true },
      { name: 'Команда', included: false },
      { name: 'Кампанії', included: false },
    ],
    recommended: true,
  },
  {
    id: 'small',
    name: 'Малий бізнес',
    price: 499,
    period: 'місяць',
    color: '#8b5cf6',
    icon: Megaphone,
    features: [
      { name: 'Все з Індивідуального', included: true },
      { name: 'Команда до 10 осіб', included: true },
      { name: 'Маркетингові кампанії', included: true },
      { name: 'Розширена аналітика', included: true },
      { name: 'Пріоритетна підтримка', included: true },
      { name: 'API доступ', included: false },
    ],
  },
  {
    id: 'medium',
    name: 'Середній бізнес',
    price: 999,
    period: 'місяць',
    color: '#f59e0b',
    icon: Crown,
    features: [
      { name: 'Все з Малого бізнесу', included: true },
      { name: 'Необмежена команда', included: true },
      { name: 'API доступ', included: true },
      { name: 'Білий лейбл', included: true },
      { name: 'Персональний менеджер', included: true },
      { name: 'SLA гарантії', included: true },
    ],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const currentPlan = PLANS.find((p) => p.id === user?.role);

  const handleUpgrade = (planId: UserRole) => {
    if (planId === user?.role) {
      Alert.alert('Інформація', 'Ви вже використовуєте цей тариф');
      return;
    }

    Alert.alert(
      'Оновлення тарифу',
      'Інтеграція з платіжною системою буде доступна в наступній версії',
      [{ text: 'Зрозуміло' }]
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Підписка і тариф" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        {currentPlan && (
          <Card style={tw`mb-4`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Поточний тариф
              </Text>
              <View
                style={[
                  tw`px-3 py-1 rounded-full`,
                  { backgroundColor: `${currentPlan.color}20` },
                ]}
              >
                <Text style={[tw`text-sm font-semibold`, { color: currentPlan.color }]}>
                  {currentPlan.name}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-baseline mb-4`}>
              <Text style={tw`text-4xl font-bold text-gray-900`}>
                ₴{currentPlan.price}
              </Text>
              <Text style={tw`text-gray-600 ml-2`}>/ {currentPlan.period}</Text>
            </View>

            <View style={tw`bg-blue-50 rounded-lg p-3`}>
              <Text style={tw`text-sm text-blue-900 font-medium`}>
                {currentPlan.price === 0
                  ? 'Безкоштовний тариф'
                  : 'Наступне списання: ' +
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
                      'uk-UA'
                    )}
              </Text>
            </View>
          </Card>
        )}

        <Text style={tw`text-2xl font-bold text-gray-900 mb-4`}>Оберіть тариф</Text>

        {PLANS.map((plan) => (
          <Card key={plan.id} style={tw`mb-4 relative`}>
            {plan.recommended && (
              <View
                style={tw`absolute -top-2 right-4 bg-blue-600 px-3 py-1 rounded-full`}
              >
                <Text style={tw`text-xs font-bold text-white`}>Рекомендуємо</Text>
              </View>
            )}

            <View style={tw`flex-row items-center mb-3`}>
              <View
                style={[
                  tw`w-12 h-12 rounded-full items-center justify-center mr-3`,
                  { backgroundColor: `${plan.color}20` },
                ]}
              >
                {React.createElement(plan.icon, {
                  size: 24,
                  color: plan.color,
                })}
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>{plan.name}</Text>
                <View style={tw`flex-row items-baseline`}>
                  <Text style={tw`text-2xl font-bold text-gray-900`}>
                    ₴{plan.price}
                  </Text>
                  <Text style={tw`text-gray-600 ml-1`}>/ {plan.period}</Text>
                </View>
              </View>
            </View>

            <View style={tw`space-y-2 mb-4`}>
              {plan.features.map((feature, index) => (
                <View key={index} style={tw`flex-row items-center`}>
                  {feature.included ? (
                    <Check size={16} color="#16a34a" />
                  ) : (
                    <X size={16} color="#9ca3af" />
                  )}
                  <Text
                    style={tw`text-sm ml-2 ${
                      feature.included ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {feature.name}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              title={
                plan.id === user?.role
                  ? 'Поточний тариф'
                  : plan.price === 0
                  ? 'Безкоштовно'
                  : 'Обрати тариф'
              }
              onPress={() => handleUpgrade(plan.id)}
              variant={plan.id === user?.role ? 'outline' : 'primary'}
              disabled={plan.id === user?.role}
              fullWidth
            />
          </Card>
        ))}

        <Card>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Часті запитання
          </Text>

          <View style={tw`space-y-3`}>
            <View>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Чи можна змінити тариф?
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Так, ви можете оновити або понизити тариф у будь-який час.
              </Text>
            </View>

            <View>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Що станеться з моїми даними?
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Всі ваші дані залишаються збереженими при зміні тарифу.
              </Text>
            </View>

            <View>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Чи є пробний період?
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Так, для платних тарифів доступний 14-денний пробний період.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
