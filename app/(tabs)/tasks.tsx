import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Flag,
  ChevronRight,
  Download,
} from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';
import { realtimeService } from '@/services/realtimeService';
import { exportService } from '@/services/exportService';

export default function TasksScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { tasks, setTasks, updateTask } = useTasksStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      const updates: Partial<Task> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', task.id);

      if (error) throw error;

      updateTask(task.id, updates);
      Alert.alert('Успіх', 'Статус завдання оновлено');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Помилка', 'Не вдалося оновити статус');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} color="#16a34a" />;
      case 'in_progress':
        return <Clock size={18} color="#0284c7" />;
      case 'cancelled':
        return <XCircle size={18} color="#ef4444" />;
      default:
        return <AlertCircle size={18} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
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

  const getPriorityIcon = (priority: string) => {
    const color =
      priority === 'urgent'
        ? '#ef4444'
        : priority === 'high'
        ? '#f59e0b'
        : priority === 'medium'
        ? '#0284c7'
        : '#6b7280';
    return <Flag size={14} color={color} fill={color} />;
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Протерміновано ${Math.abs(diffDays)} дн.`;
    } else if (diffDays === 0) {
      return 'Сьогодні';
    } else if (diffDays === 1) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header
          title="Завдання"
          showBack
          rightAction={
            <TouchableOpacity onPress={() => router.push('/tasks/new')}>
              <Plus size={24} color="#0284c7" />
            </TouchableOpacity>
          }
        />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header
        title="Завдання"
        showBack
        rightAction={
          <TouchableOpacity onPress={() => router.push('/tasks/new')}>
            <Plus size={24} color="#0284c7" />
          </TouchableOpacity>
        }
      />

      {tasks.length === 0 ? (
        <ScrollView
          contentContainerStyle={tw`flex-1 p-4`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0284c7"
            />
          }
        >
          <EmptyState
            icon={<CheckSquare size={48} color="#9ca3af" />}
            title="Немає завдань"
            description="Створіть перше завдання для відстеження прогресу"
            action={
              <Button title="Створити завдання" onPress={() => router.push('/tasks/new')} />
            }
          />
        </ScrollView>
      ) : (
        <>
          <View style={tw`px-4 pt-4 pb-2`}>
            <View style={tw`flex-row gap-2 mb-3`}>
              {[
                { id: 'all', label: 'Всі', count: stats.all },
                { id: 'pending', label: 'Очікують', count: stats.pending },
                { id: 'in_progress', label: 'У роботі', count: stats.in_progress },
                { id: 'completed', label: 'Виконано', count: stats.completed },
              ].map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFilter(f.id as any)}
                  style={tw`flex-1 px-2 py-2 rounded-lg ${
                    filter === f.id ? 'bg-blue-600' : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text
                    style={tw`text-xs font-medium text-center ${
                      filter === f.id ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {f.label} ({f.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={tw`p-4 pt-2`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#0284c7"
              />
            }
          >
            {filteredTasks.length === 0 ? (
              <Card>
                <View style={tw`py-8 items-center`}>
                  <CheckSquare size={32} color="#9ca3af" />
                  <Text style={tw`text-gray-600 mt-2`}>Завдань не знайдено</Text>
                </View>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onPress={() => router.push(`/tasks/${task.id}`)}
                  onStatusChange={(newStatus) => handleStatusChange(task, newStatus)}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getPriorityIcon={getPriorityIcon}
                  formatDate={formatDate}
                />
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onStatusChange: (status: Task['status']) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
  formatDate: (date?: string) => string;
}

function TaskItem({
  task,
  onPress,
  onStatusChange,
  getStatusIcon,
  getStatusColor,
  getStatusLabel,
  getPriorityIcon,
  formatDate,
}: TaskItemProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (task.status === 'completed' || task.status === 'cancelled') return;
      translateX.value = Math.max(-80, Math.min(80, event.translationX));
    })
    .onEnd(() => {
      if (translateX.value > 40) {
        runOnJS(onStatusChange)('completed');
      } else if (translateX.value < -40) {
        runOnJS(onStatusChange)('in_progress');
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[tw`mb-3`, animatedStyle]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Card>
            <View style={tw`flex-row items-start justify-between mb-2`}>
              <View style={tw`flex-1`}>
                <Text
                  style={tw`text-base font-semibold text-gray-900 ${
                    task.status === 'completed' ? 'line-through opacity-60' : ''
                  }`}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
              </View>
              <View style={tw`flex-row items-center ml-2`}>
                {getPriorityIcon(task.priority)}
                <ChevronRight size={16} color="#9ca3af" style={tw`ml-1`} />
              </View>
            </View>

            {task.description && (
              <Text
                style={tw`text-sm text-gray-600 mb-2 ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}

            <View style={tw`flex-row items-center justify-between`}>
              <View
                style={tw`flex-row items-center px-2 py-1 rounded-full ${getStatusColor(
                  task.status
                )}`}
              >
                {getStatusIcon(task.status)}
                <Text style={tw`text-xs font-medium ml-1`}>{getStatusLabel(task.status)}</Text>
              </View>

              {task.due_date && (
                <View style={tw`flex-row items-center`}>
                  <Clock size={12} color="#6b7280" />
                  <Text
                    style={tw`text-xs ${
                      new Date(task.due_date) < new Date() && task.status !== 'completed'
                        ? 'text-red-600 font-semibold'
                        : 'text-gray-600'
                    } ml-1`}
                  >
                    {formatDate(task.due_date)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}
