import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, User, Edit, Trash2, Eye, Download, Filter } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
  user?: {
    full_name: string;
  };
}

export default function AuditLogScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);

      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:users(full_name)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('action', filter.toUpperCase());
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Edit size={16} color="#16a34a" />;
      case 'UPDATE':
        return <Edit size={16} color="#f59e0b" />;
      case 'DELETE':
        return <Trash2 size={16} color="#ef4444" />;
      case 'VIEW':
        return <Eye size={16} color="#3b82f6" />;
      case 'EXPORT':
        return <Download size={16} color="#8b5cf6" />;
      default:
        return <Shield size={16} color="#6b7280" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'Створено';
      case 'UPDATE':
        return 'Оновлено';
      case 'DELETE':
        return 'Видалено';
      case 'VIEW':
        return 'Переглянуто';
      case 'EXPORT':
        return 'Експортовано';
      case 'LOGIN':
        return 'Вхід';
      case 'LOGOUT':
        return 'Вихід';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return '#16a34a';
      case 'UPDATE':
        return '#f59e0b';
      case 'DELETE':
        return '#ef4444';
      case 'VIEW':
        return '#3b82f6';
      case 'EXPORT':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getTableLabel = (tableName: string) => {
    const labels: Record<string, string> = {
      orders: 'Замовлення',
      clients: 'Клієнти',
      meetings: 'Зустрічі',
      tasks: 'Завдання',
      campaigns: 'Кампанії',
      users: 'Користувачі',
    };
    return labels[tableName] || tableName;
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="Журнал дій" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Журнал дій" showBack />

      <View style={tw`p-4`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
          {['all', 'insert', 'update', 'delete', 'export'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                tw`px-4 py-2 rounded-full mr-2`,
                filter === f ? tw`bg-blue-600` : tw`bg-white border border-gray-300`,
              ]}
            >
              <Text
                style={tw`text-sm font-medium ${filter === f ? 'text-white' : 'text-gray-700'}`}
              >
                {f === 'all' ? 'Всі' : getActionLabel(f.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={tw`p-4 pt-0`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {logs.length === 0 ? (
          <EmptyState
            icon={<Shield size={48} color="#9ca3af" />}
            title="Немає записів"
            description="Журнал дій порожній"
          />
        ) : (
          logs.map((log) => (
            <Card key={log.id} style={tw`mb-3`}>
              <View style={tw`flex-row items-start`}>
                <View
                  style={[
                    tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
                    { backgroundColor: `${getActionColor(log.action)}20` },
                  ]}
                >
                  {getActionIcon(log.action)}
                </View>

                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center justify-between mb-1`}>
                    <Text
                      style={[tw`text-sm font-semibold`, { color: getActionColor(log.action) }]}
                    >
                      {getActionLabel(log.action)}
                    </Text>
                    <Text style={tw`text-xs text-gray-500`}>
                      {new Date(log.created_at).toLocaleString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <Text style={tw`text-base font-medium text-gray-900 mb-1`}>
                    {getTableLabel(log.table_name)}
                  </Text>

                  <View style={tw`flex-row items-center`}>
                    <User size={14} color="#6b7280" />
                    <Text style={tw`text-sm text-gray-600 ml-1`}>
                      {log.user?.full_name || 'Система'}
                    </Text>
                  </View>

                  {log.record_id && (
                    <Text style={tw`text-xs text-gray-500 mt-1`}>
                      ID: {log.record_id.slice(0, 8)}...
                    </Text>
                  )}

                  {log.action === 'UPDATE' && log.old_values && log.new_values && (
                    <View style={tw`bg-gray-50 rounded-lg p-2 mt-2`}>
                      <Text style={tw`text-xs text-gray-600`}>Зміни:</Text>
                      {Object.keys(log.new_values)
                        .filter(
                          (key) =>
                            JSON.stringify(log.old_values[key]) !==
                            JSON.stringify(log.new_values[key])
                        )
                        .slice(0, 3)
                        .map((key) => (
                          <View key={key} style={tw`mt-1`}>
                            <Text style={tw`text-xs text-gray-700 font-medium`}>{key}:</Text>
                            <Text style={tw`text-xs text-red-600`}>
                              - {JSON.stringify(log.old_values[key])}
                            </Text>
                            <Text style={tw`text-xs text-green-600`}>
                              + {JSON.stringify(log.new_values[key])}
                            </Text>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
