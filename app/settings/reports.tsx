import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText,
  Download,
  Calendar,
  Users,
  ShoppingBag,
  BarChart3,
  ChevronRight,
} from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useClientsStore } from '@/store/clientsStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { pdfService } from '@/services/pdfService';
import { exportService } from '@/services/exportService';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: () => void;
}

export default function ReportsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { orders } = useOrdersStore();
  const { clients } = useClientsStore();
  const { kpis } = useAnalyticsStore();

  const [generating, setGenerating] = useState<string | null>(null);

  const handleGeneratePDF = async (type: string) => {
    try {
      setGenerating(type);

      switch (type) {
        case 'orders':
          await pdfService.generateOrdersReport(orders, clients);
          break;
        case 'clients':
          await pdfService.generateClientsReport(clients);
          break;
        case 'analytics':
          await pdfService.generateAnalyticsReport({
            revenue: 0,
            newClients: 0,
            ordersCount: orders.length,
            meetingsCount: 0,
            period: 'Поточний місяць',
          });
          break;
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Помилка', 'Не вдалося згенерувати звіт');
    } finally {
      setGenerating(null);
    }
  };

  const handleExportCSV = async (type: string) => {
    try {
      setGenerating(type);

      let success = false;
      switch (type) {
        case 'orders':
          success = await exportService.exportOrdersToCSV(orders, clients);
          break;
        case 'clients':
          success = await exportService.exportClientsToCSV(clients);
          break;
        case 'analytics':
          success = await exportService.exportAnalyticsToCSV({
            kpis: [],
            revenueByMonth: [],
            ordersByStatus: [],
            topClients: [],
          });
          break;
      }

      if (success) {
        Alert.alert('Успіх', 'Дані експортовано у CSV');
      }
    } catch (error) {
      console.error('CSV export error:', error);
      Alert.alert('Помилка', 'Не вдалося експортувати дані');
    } finally {
      setGenerating(null);
    }
  };

  const reports: ReportType[] = [
    {
      id: 'orders',
      title: 'Звіт по замовленнях',
      description: `${orders.length} замовлень`,
      icon: ShoppingBag,
      color: '#0284c7',
      action: () => handleGeneratePDF('orders'),
    },
    {
      id: 'clients',
      title: 'Звіт по клієнтах',
      description: `${clients.length} клієнтів`,
      icon: Users,
      color: '#8b5cf6',
      action: () => handleGeneratePDF('clients'),
    },
    {
      id: 'analytics',
      title: 'Аналітичний звіт',
      description: 'KPI та метрики',
      icon: BarChart3,
      color: '#16a34a',
      action: () => handleGeneratePDF('analytics'),
    },
  ];

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Звіти" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-center mb-2`}>
            <FileText size={24} color="#0284c7" />
            <Text style={tw`text-lg font-semibold text-gray-900 ml-2`}>
              Доступні звіти
            </Text>
          </View>
          <Text style={tw`text-sm text-gray-600`}>
            Генеруйте PDF звіти або експортуйте дані у CSV форматі
          </Text>
        </Card>

        {reports.map((report) => {
          const Icon = report.icon;
          const isGenerating = generating === report.id;

          return (
            <Card key={report.id} style={tw`mb-3`}>
              <View style={tw`flex-row items-center mb-3`}>
                <View
                  style={[
                    tw`w-12 h-12 rounded-full items-center justify-center mr-3`,
                    { backgroundColor: `${report.color}20` },
                  ]}
                >
                  <Icon size={24} color={report.color} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-semibold text-gray-900`}>
                    {report.title}
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>{report.description}</Text>
                </View>
              </View>

              <View style={tw`flex-row gap-3`}>
                <Button
                  title="PDF"
                  onPress={() => handleGeneratePDF(report.id)}
                  loading={isGenerating}
                  style={tw`flex-1`}
                  
                />
                <Button
                  title="CSV"
                  onPress={() => handleExportCSV(report.id)}
                  variant="outline"
                  style={tw`flex-1`}
                  
                />
              </View>
            </Card>
          );
        })}

        <Card>
          <Text style={tw`text-sm font-semibold text-gray-900 mb-3`}>Інформація</Text>
          <View style={tw`space-y-2`}>
            <Text style={tw`text-sm text-gray-600`}>
              • PDF звіти доступні у веб-версії
            </Text>
            <Text style={tw`text-sm text-gray-600`}>
              • CSV експорт працює на всіх платформах
            </Text>
            <Text style={tw`text-sm text-gray-600`}>
              • Звіти містять дані за поточний період
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
