import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search as SearchIcon,
  Users,
  ShoppingBag,
  Calendar,
  CheckSquare,
  Megaphone,
  X,
  ArrowRight,
} from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  type: 'client' | 'order' | 'meeting' | 'task' | 'campaign';
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { user } = useAuthStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'order' | 'meeting' | 'task' | 'campaign'>('all');

  useEffect(() => {
    if (query.length >= 2) {
      searchAll();
    } else {
      setResults([]);
    }
  }, [query, activeTab]);

  const searchAll = async () => {
    if (!user?.org_id || query.length < 2) return;

    try {
      setLoading(true);
      const results: SearchResult[] = [];

      if (activeTab === 'all' || activeTab === 'client') {
        const { data: clients } = await supabase
          .from('clients')
          .select('id, full_name, email, phone')
          .eq('org_id', user.org_id)
          .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
          .limit(5);

        if (clients) {
          results.push(
            ...clients.map((c) => ({
              type: 'client' as const,
              id: c.id,
              title: c.full_name,
              subtitle: c.email || c.phone,
            }))
          );
        }
      }

      if (activeTab === 'all' || activeTab === 'order') {
        const { data: orders } = await supabase
          .from('orders')
          .select('id, title, status, created_at')
          .eq('org_id', user.org_id)
          .ilike('title', `%${query}%`)
          .limit(5);

        if (orders) {
          results.push(
            ...orders.map((o) => ({
              type: 'order' as const,
              id: o.id,
              title: o.title,
              subtitle: o.status,
              date: o.created_at,
            }))
          );
        }
      }

      if (activeTab === 'all' || activeTab === 'meeting') {
        const { data: meetings } = await supabase
          .from('meetings')
          .select('id, title, start_time, location')
          .eq('org_id', user.org_id)
          .ilike('title', `%${query}%`)
          .limit(5);

        if (meetings) {
          results.push(
            ...meetings.map((m) => ({
              type: 'meeting' as const,
              id: m.id,
              title: m.title,
              subtitle: m.location,
              date: m.start_time,
            }))
          );
        }
      }

      if (activeTab === 'all' || activeTab === 'task') {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, status, due_date')
          .eq('org_id', user.org_id)
          .ilike('title', `%${query}%`)
          .limit(5);

        if (tasks) {
          results.push(
            ...tasks.map((t) => ({
              type: 'task' as const,
              id: t.id,
              title: t.title,
              subtitle: t.status,
              date: t.due_date,
            }))
          );
        }
      }

      if (activeTab === 'all' || activeTab === 'campaign') {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, name, status, created_at')
          .eq('org_id', user.org_id)
          .ilike('name', `%${query}%`)
          .limit(5);

        if (campaigns) {
          results.push(
            ...campaigns.map((c) => ({
              type: 'campaign' as const,
              id: c.id,
              title: c.name,
              subtitle: c.status,
              date: c.created_at,
            }))
          );
        }
      }

      setResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'client':
        router.push(`/clients/${result.id}`);
        break;
      case 'order':
        router.push(`/orders/${result.id}`);
        break;
      case 'meeting':
        router.push(`/meetings/${result.id}`);
        break;
      case 'task':
        router.push(`/tasks/${result.id}`);
        break;
      case 'campaign':
        router.push(`/campaigns/${result.id}`);
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <Users size={20} color="#0284c7" />;
      case 'order':
        return <ShoppingBag size={20} color="#0284c7" />;
      case 'meeting':
        return <Calendar size={20} color="#0284c7" />;
      case 'task':
        return <CheckSquare size={20} color="#0284c7" />;
      case 'campaign':
        return <Megaphone size={20} color="#0284c7" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'client':
        return 'Клієнт';
      case 'order':
        return 'Замовлення';
      case 'meeting':
        return 'Зустріч';
      case 'task':
        return 'Завдання';
      case 'campaign':
        return 'Кампанія';
      default:
        return type;
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header title="Пошук" showBack />

      <View style={tw`p-4`}>
        <View style={tw`flex-row items-center bg-white rounded-lg border border-gray-300 px-4 py-3 mb-4`}>
          <SearchIcon size={20} color="#6b7280" />
          <TextInput
            style={tw`flex-1 ml-3 text-base text-gray-900`}
            placeholder="Пошук клієнтів, замовлень, зустрічей..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
          {(['all', 'client', 'order', 'meeting', 'task', 'campaign'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                tw`px-4 py-2 rounded-full mr-2`,
                activeTab === tab ? tw`bg-blue-600` : tw`bg-white border border-gray-300`,
              ]}
            >
              <Text
                style={tw`text-sm font-medium ${
                  activeTab === tab ? 'text-white' : 'text-gray-700'
                }`}
              >
                {tab === 'all' ? 'Все' : getTypeLabel(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={tw`p-4 pt-0`}>
        {loading ? (
          <View style={tw`items-center justify-center py-12`}>
            <ActivityIndicator size="large" color="#0284c7" />
          </View>
        ) : results.length === 0 ? (
          query.length >= 2 ? (
            <EmptyState
              icon={<SearchIcon size={48} color="#9ca3af" />}
              title="Нічого не знайдено"
              description={`Спробуйте інший запит`}
            />
          ) : (
            <EmptyState
              icon={<SearchIcon size={48} color="#9ca3af" />}
              title="Почніть вводити для пошуку"
              description="Мінімум 2 символи"
            />
          )
        ) : (
          results.map((result, index) => (
            <Card key={`${result.type}-${result.id}-${index}`} style={tw`mb-3`}>
              <TouchableOpacity
                onPress={() => handleResultPress(result)}
                style={tw`flex-row items-center`}
              >
                <View
                  style={tw`w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3`}
                >
                  {getIcon(result.type)}
                </View>

                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center mb-1`}>
                    <Text style={tw`text-xs font-medium text-blue-600 mr-2`}>
                      {getTypeLabel(result.type)}
                    </Text>
                    {result.date && (
                      <Text style={tw`text-xs text-gray-500`}>
                        {new Date(result.date).toLocaleDateString('uk-UA')}
                      </Text>
                    )}
                  </View>
                  <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                    {result.title}
                  </Text>
                  {result.subtitle && (
                    <Text style={tw`text-sm text-gray-600`}>{result.subtitle}</Text>
                  )}
                </View>

                <ArrowRight size={20} color="#9ca3af" />
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
