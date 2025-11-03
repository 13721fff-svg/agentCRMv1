import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  Shield,
  AlertCircle,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import {
  PaymentMethod,
  Transaction,
  Invoice,
  PaymentProvider,
  TransactionStatus,
  CardBrand,
} from '@/types';

const CARD_BRAND_COLORS: Record<CardBrand, string> = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#006FCF',
  maestro: '#0099DF',
};

const STATUS_CONFIG = {
  pending: { label: 'Очікує', color: '#f59e0b', icon: Clock },
  processing: { label: 'Обробка', color: '#3b82f6', icon: AlertCircle },
  succeeded: { label: 'Успішно', color: '#16a34a', icon: CheckCircle },
  failed: { label: 'Помилка', color: '#ef4444', icon: XCircle },
  refunded: { label: 'Повернено', color: '#6b7280', icon: TrendingUp },
};

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [selectedTab, setSelectedTab] = useState<'methods' | 'transactions' | 'invoices'>('methods');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [methodsRes, transactionsRes, invoicesRes, providersRes] = await Promise.all([
        supabase.from('payment_methods').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('payment_providers').select('*').eq('is_active', true),
      ]);

      if (methodsRes.data) setPaymentMethods(methodsRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (providersRes.data) setProviders(providersRes.data);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Додати метод оплати',
      'Інтеграція з платіжною системою буде доступна в наступній версії. Зараз ви можете додати демо-карту.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Додати демо-карту',
          onPress: async () => {
            try {
              const demoCard: Partial<PaymentMethod> = {
                user_id: user!.id,
                org_id: user!.org_id,
                method_type: 'card',
                card_brand: 'visa',
                last_four: '4242',
                expiry_month: 12,
                expiry_year: 2025,
                cardholder_name: user!.full_name,
                is_default: paymentMethods.length === 0,
                provider_token: `demo_token_${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              const { data, error } = await supabase
                .from('payment_methods')
                .insert(demoCard)
                .select()
                .single();

              if (error) throw error;
              if (data) setPaymentMethods([data, ...paymentMethods]);
              Alert.alert('Успіх', 'Демо-карту додано');
            } catch (error) {
              console.error('Error adding payment method:', error);
              Alert.alert('Помилка', 'Не вдалося додати метод оплати');
            }
          },
        },
      ]
    );
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    Alert.alert('Видалити метод оплати', 'Ви впевнені?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('payment_methods')
              .delete()
              .eq('id', methodId);

            if (error) throw error;
            setPaymentMethods(paymentMethods.filter((m) => m.id !== methodId));
            Alert.alert('Успіх', 'Метод оплати видалено');
          } catch (error) {
            console.error('Error deleting payment method:', error);
            Alert.alert('Помилка', 'Не вдалося видалити');
          }
        },
      },
    ]);
  };

  const handleCreateDemoTransaction = async () => {
    if (!user || paymentMethods.length === 0) {
      Alert.alert('Помилка', 'Спочатку додайте метод оплати');
      return;
    }

    try {
      const demoTransaction: Partial<Transaction> = {
        user_id: user.id,
        org_id: user.org_id,
        payment_method_id: paymentMethods[0].id,
        provider_id: providers[0]?.id,
        amount: Math.floor(Math.random() * 10000) + 100,
        currency: 'UAH',
        status: 'succeeded',
        transaction_type: 'payment',
        description: 'Демо-платіж',
        provider_transaction_id: `demo_${Date.now()}`,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(demoTransaction)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTransactions([data, ...transactions]);
        Alert.alert('Успіх', 'Демо-транзакцію створено');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Помилка', 'Не вдалося створити транзакцію');
    }
  };

  const renderPaymentMethods = () => (
    <View>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-lg font-semibold text-gray-900`}>
          Методи оплати
        </Text>
        <TouchableOpacity
          onPress={handleAddPaymentMethod}
          style={tw`flex-row items-center px-3 py-1.5 bg-blue-600 rounded-lg`}
        >
          <Plus size={16} color="#fff" />
          <Text style={tw`text-sm font-medium text-white ml-1`}>Додати</Text>
        </TouchableOpacity>
      </View>

      {paymentMethods.length === 0 ? (
        <Card>
          <View style={tw`py-8 items-center`}>
            <CreditCard size={48} color="#9ca3af" />
            <Text style={tw`text-gray-600 mt-3 text-center`}>
              Немає методів оплати
            </Text>
            <Text style={tw`text-sm text-gray-500 mt-1 text-center`}>
              Додайте картку або банківський рахунок
            </Text>
          </View>
        </Card>
      ) : (
        paymentMethods.map((method) => (
          <Card key={method.id} style={tw`mb-3`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <View
                    style={[
                      tw`w-12 h-8 rounded items-center justify-center mr-3`,
                      { backgroundColor: method.card_brand ? CARD_BRAND_COLORS[method.card_brand] : '#6b7280' },
                    ]}
                  >
                    <Text style={tw`text-xs font-bold text-white uppercase`}>
                      {method.card_brand || 'CARD'}
                    </Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-base font-semibold text-gray-900`}>
                      •••• {method.last_four}
                    </Text>
                    <Text style={tw`text-sm text-gray-600`}>
                      {method.cardholder_name || 'Власник'}
                    </Text>
                  </View>
                </View>
                <View style={tw`flex-row items-center`}>
                  {method.is_default && (
                    <View style={tw`px-2 py-0.5 bg-green-100 rounded mr-2`}>
                      <Text style={tw`text-xs font-medium text-green-700`}>
                        За замовчуванням
                      </Text>
                    </View>
                  )}
                  <Text style={tw`text-xs text-gray-500`}>
                    Дійсна до {method.expiry_month}/{method.expiry_year}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeletePaymentMethod(method.id)}
                style={tw`ml-3`}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </Card>
        ))
      )}

      {providers.length > 0 && (
        <Card style={tw`mt-4 bg-blue-50 border-0`}>
          <View style={tw`flex-row items-start`}>
            <Shield size={20} color="#0284c7" style={tw`mr-3 mt-0.5`} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Безпечні платежі
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Інтегровано з {providers[0].name}. Всі дані захищені.
              </Text>
            </View>
          </View>
        </Card>
      )}
    </View>
  );

  const renderTransactions = () => (
    <View>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-lg font-semibold text-gray-900`}>
          Історія транзакцій
        </Text>
        <TouchableOpacity
          onPress={handleCreateDemoTransaction}
          style={tw`px-3 py-1.5 bg-green-600 rounded-lg`}
        >
          <Text style={tw`text-sm font-medium text-white`}>Демо</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <Card>
          <View style={tw`py-8 items-center`}>
            <DollarSign size={48} color="#9ca3af" />
            <Text style={tw`text-gray-600 mt-3 text-center`}>
              Немає транзакцій
            </Text>
          </View>
        </Card>
      ) : (
        transactions.map((transaction) => {
          const statusConfig = STATUS_CONFIG[transaction.status];
          return (
            <Card key={transaction.id} style={tw`mb-3`}>
              <View style={tw`flex-row items-start justify-between mb-2`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                    {transaction.description || 'Платіж'}
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    {React.createElement(statusConfig.icon, {
                      size: 14,
                      color: statusConfig.color,
                    })}
                    <Text
                      style={[tw`text-sm font-medium ml-1`, { color: statusConfig.color }]}
                    >
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
                <View style={tw`items-end`}>
                  <Text style={tw`text-xl font-bold text-gray-900`}>
                    ₴{transaction.amount.toLocaleString('uk-UA')}
                  </Text>
                  <Text style={tw`text-xs text-gray-500`}>
                    {new Date(transaction.created_at).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </View>
              {transaction.provider_transaction_id && (
                <Text style={tw`text-xs text-gray-500 mt-2`}>
                  ID: {transaction.provider_transaction_id}
                </Text>
              )}
            </Card>
          );
        })
      )}
    </View>
  );

  const renderInvoices = () => (
    <View>
      <Text style={tw`text-lg font-semibold text-gray-900 mb-4`}>
        Рахунки та інвойси
      </Text>

      {invoices.length === 0 ? (
        <Card>
          <View style={tw`py-8 items-center`}>
            <FileText size={48} color="#9ca3af" />
            <Text style={tw`text-gray-600 mt-3 text-center`}>
              Немає рахунків
            </Text>
          </View>
        </Card>
      ) : (
        invoices.map((invoice) => (
          <Card key={invoice.id} style={tw`mb-3`}>
            <View style={tw`flex-row items-start justify-between`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                  Рахунок #{invoice.invoice_number}
                </Text>
                <Text style={tw`text-sm text-gray-600 mb-2`}>
                  Статус: {invoice.status}
                </Text>
                <Text style={tw`text-xs text-gray-500`}>
                  {new Date(invoice.created_at).toLocaleDateString('uk-UA')}
                </Text>
              </View>
              <View style={tw`items-end`}>
                <Text style={tw`text-xl font-bold text-gray-900 mb-2`}>
                  ₴{invoice.amount.toLocaleString('uk-UA')}
                </Text>
                <TouchableOpacity style={tw`flex-row items-center`}>
                  <Download size={14} color="#0284c7" />
                  <Text style={tw`text-sm text-blue-600 ml-1`}>PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );

  const tabs = [
    { id: 'methods', label: 'Методи оплати', icon: CreditCard },
    { id: 'transactions', label: 'Транзакції', icon: DollarSign },
    { id: 'invoices', label: 'Рахунки', icon: FileText },
  ];

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Платежі та оплата" showBack />

      <View style={tw`px-4 pt-4 pb-2`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={tw`flex-row gap-2`}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setSelectedTab(tab.id as any)}
                style={[
                  tw`flex-row items-center px-4 py-2 rounded-lg`,
                  selectedTab === tab.id
                    ? tw`bg-blue-600`
                    : tw`bg-white border border-gray-200`,
                ]}
              >
                {React.createElement(tab.icon, {
                  size: 16,
                  color: selectedTab === tab.id ? '#fff' : '#6b7280',
                })}
                <Text
                  style={[
                    tw`text-sm font-medium ml-2`,
                    selectedTab === tab.id ? tw`text-white` : tw`text-gray-700`,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={tw`p-4`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0284c7"
          />
        }
      >
        {selectedTab === 'methods' && renderPaymentMethods()}
        {selectedTab === 'transactions' && renderTransactions()}
        {selectedTab === 'invoices' && renderInvoices()}

        <Card style={tw`mt-4 bg-yellow-50 border-0`}>
          <View style={tw`flex-row items-start`}>
            <AlertCircle size={20} color="#f59e0b" style={tw`mr-3 mt-0.5`} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-medium text-gray-900 mb-1`}>
                Демо-режим
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Зараз працює демо-версія. Інтеграція з реальними платіжними системами
                (LiqPay, Stripe, WayForPay) буде доступна після активації.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
