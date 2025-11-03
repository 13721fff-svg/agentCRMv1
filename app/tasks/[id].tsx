import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  CheckSquare,
  Clock,
  Flag,
  User,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Play,
  XCircle,
} from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { useTeamStore } from '@/store/teamStore';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { tasks, updateTask, deleteTask: deleteTaskFromStore } = useTasksStore();
  const { members } = useTeamStore();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const foundTask = tasks.find((t) => t.id === id);

      if (foundTask) {
        setTask(foundTask);
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTask(data);
      }
    } catch (error) {
      console.error('Error loading task:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити завдання');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!task) return;

    try {
      setActionLoading(true);

      const updates: Partial<Task> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase.from('tasks').update(updates).eq('id', id);

      if (error) throw error;

      updateTask(id, updates);
      setTask({ ...task, ...updates });
      Alert.alert('Успіх', 'Статус завдання оновлено');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Помилка', 'Не вдалося оновити статус');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Видалити завдання', 'Ви впевнені, що хочете видалити це завдання?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;

            deleteTaskFromStore(id);
            router.back();
          } catch (error) {
            console.error('Error deleting task:', error);
            Alert.alert('Помилка', 'Не вдалося видалити завдання');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Виконано';
      case 'in_progress':
        return 'У роботі';
      case 'cancelled':
        return 'Скасовано';
      default:
        return 'Очікує';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '#ef4444' };
      case 'high':
        return { bg: '#fffbeb', border: '#fed7aa', text: '#92400e', icon: '#f59e0b' };
      case 'medium':
        return { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', icon: '#0284c7' };
      default:
        return { bg: '#f9fafb', border: '#e5e7eb', text: '#374151', icon: '#6b7280' };
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Терміново';
      case 'high':
        return 'Високий';
      case 'medium':
        return 'Середній';
      default:
        return 'Низький';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAssignedMember = () => {
    if (!task?.assigned_to) return null;
    return members.find((m) => m.id === task.assigned_to);
  };

  if (loading) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title="Завантаження..." showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <Header title="Помилка" showBack />
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <CheckSquare size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 mt-4`}>Завдання не знайдено</Text>
        </View>
      </View>
    );
  }

  const priorityColors = getPriorityColor(task.priority);
  const assignedMember = getAssignedMember();

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header
        title="Деталі завдання"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-start justify-between mb-3`}>
            <View style={tw`flex-1`}>
              <Text
                style={tw`text-2xl font-bold text-gray-900 mb-2 ${
                  task.status === 'completed' ? 'line-through opacity-60' : ''
                }`}
              >
                {task.title}
              </Text>
              <View
                style={tw`flex-row items-center px-3 py-1.5 rounded-full border ${getStatusColor(
                  task.status
                )} self-start`}
              >
                <Text style={tw`text-sm font-medium`}>{getStatusLabel(task.status)}</Text>
              </View>
            </View>
          </View>

          {task.description && (
            <View style={tw`mb-4 pb-4 border-b border-gray-200`}>
              <Text style={tw`text-base text-gray-700`}>{task.description}</Text>
            </View>
          )}

          <View style={tw`space-y-3`}>
            <View style={tw`flex-row items-center`}>
              <View
                style={tw.style('w-10 h-10 rounded-full items-center justify-center mr-3', {
                  backgroundColor: priorityColors.bg,
                })}
              >
                <Flag size={20} color={priorityColors.icon} fill={priorityColors.icon} />
              </View>
              <View>
                <Text style={tw`text-sm text-gray-600`}>Пріоритет</Text>
                <Text style={[tw`text-base font-semibold`, { color: priorityColors.text }]}>
                  {getPriorityLabel(task.priority)}
                </Text>
              </View>
            </View>

            {task.due_date && (
              <View style={tw`flex-row items-center mt-3`}>
                <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}>
                  <Calendar size={20} color="#0284c7" />
                </View>
                <View>
                  <Text style={tw`text-sm text-gray-600`}>Термін виконання</Text>
                  <Text
                    style={tw`text-base font-medium ${
                      new Date(task.due_date) < new Date() && task.status !== 'completed'
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {formatDate(task.due_date)}
                  </Text>
                </View>
              </View>
            )}

            {assignedMember && (
              <View style={tw`flex-row items-center mt-3`}>
                <View
                  style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}
                >
                  <User size={20} color="#8b5cf6" />
                </View>
                <View>
                  <Text style={tw`text-sm text-gray-600`}>Виконавець</Text>
                  <Text style={tw`text-base font-medium text-gray-900`}>
                    {assignedMember.full_name}
                  </Text>
                </View>
              </View>
            )}

            {task.completed_at && (
              <View style={tw`flex-row items-center mt-3`}>
                <View
                  style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}
                >
                  <CheckCircle size={20} color="#16a34a" />
                </View>
                <View>
                  <Text style={tw`text-sm text-gray-600`}>Виконано</Text>
                  <Text style={tw`text-base font-medium text-gray-900`}>
                    {formatDate(task.completed_at)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>Змінити статус</Text>

          {task.status === 'pending' && (
            <View style={tw`gap-2`}>
              <Button
                title="Почати виконання"
                onPress={() => handleStatusChange('in_progress')}
                loading={actionLoading}
                fullWidth
              />
              <Button
                title="Відмінити завдання"
                onPress={() => handleStatusChange('cancelled')}
                loading={actionLoading}
                variant="secondary"
                fullWidth
              />
            </View>
          )}

          {task.status === 'in_progress' && (
            <View style={tw`gap-2`}>
              <Button
                title="Позначити виконаним"
                onPress={() => handleStatusChange('completed')}
                loading={actionLoading}
                fullWidth
              />
              <Button
                title="Повернути до очікування"
                onPress={() => handleStatusChange('pending')}
                loading={actionLoading}
                variant="secondary"
                fullWidth
              />
            </View>
          )}

          {task.status === 'completed' && (
            <View style={tw`bg-green-50 border border-green-200 rounded-lg p-4`}>
              <View style={tw`flex-row items-center`}>
                <CheckCircle size={20} color="#16a34a" />
                <Text style={tw`text-sm text-green-800 ml-2 font-medium`}>
                  Завдання виконано
                </Text>
              </View>
              <Button
                title="Повернути у роботу"
                onPress={() => handleStatusChange('in_progress')}
                loading={actionLoading}
                variant="secondary"
                fullWidth
                style={tw`mt-3`}
              />
            </View>
          )}

          {task.status === 'cancelled' && (
            <View style={tw`bg-red-50 border border-red-200 rounded-lg p-4`}>
              <View style={tw`flex-row items-center`}>
                <XCircle size={20} color="#ef4444" />
                <Text style={tw`text-sm text-red-800 ml-2 font-medium`}>
                  Завдання скасовано
                </Text>
              </View>
              <Button
                title="Відновити завдання"
                onPress={() => handleStatusChange('pending')}
                loading={actionLoading}
                variant="secondary"
                fullWidth
                style={tw`mt-3`}
              />
            </View>
          )}
        </Card>

        <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4`}>
          <View style={tw`flex-row items-start`}>
            <Clock size={20} color="#0284c7" style={tw`mt-0.5`} />
            <View style={tw`flex-1 ml-3`}>
              <Text style={tw`text-sm font-semibold text-blue-900 mb-1`}>
                Push-нагадування
              </Text>
              <Text style={tw`text-sm text-blue-800`}>
                {task.due_date
                  ? 'Ви отримаєте нагадування за 1 годину до терміну виконання'
                  : 'Встановіть термін виконання для автоматичних нагадувань'}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`text-center`}>
          <Text style={tw`text-xs text-gray-500`}>
            Створено: {formatDate(task.created_at)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
