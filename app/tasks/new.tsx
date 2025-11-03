import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Flag, Clock, User } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import DateTimePicker from '@/components/DateTimePicker';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { useTeamStore } from '@/store/teamStore';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/services/notificationService';

export default function NewTaskScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { addTask } = useTasksStore();
  const { members } = useTeamStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const priorities = [
    { id: 'low', label: 'Низький', color: '#6b7280' },
    { id: 'medium', label: 'Середній', color: '#0284c7' },
    { id: 'high', label: 'Високий', color: '#f59e0b' },
    { id: 'urgent', label: 'Терміново', color: '#ef4444' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Помилка', 'Введіть назву завдання');
      return;
    }

    if (!user?.org_id || !user?.id) return;

    try {
      setSaving(true);

      const taskData = {
        org_id: user.org_id,
        title,
        description: description || null,
        status: 'pending' as const,
        priority,
        assigned_to: assignedTo,
        due_date: dueDate?.toISOString() || null,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      addTask(data);

      if (dueDate) {
        await notificationService.scheduleTaskNotification({
          id: data.id,
          title: data.title,
          dueDate: data.due_date,
          priority: data.priority,
        });
      }

      Alert.alert('Успіх', 'Завдання створено', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Помилка', 'Не вдалося створити завдання');
    } finally {
      setSaving(false);
    }
  };

  const scheduleNotification = (taskId: string, taskTitle: string, date: Date) => {
    console.log(`Push-нагадування заплановано для завдання "${taskTitle}" на ${date.toISOString()}`);
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Нове завдання" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
            Основна інформація
          </Text>

          <Input
            label="Назва завдання *"
            value={title}
            onChangeText={setTitle}
            placeholder="Наприклад, Підготувати презентацію"
          />

          <Input
            label="Опис"
            value={description}
            onChangeText={setDescription}
            placeholder="Додайте деталі завдання"
            multiline
            numberOfLines={4}
          />
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>Пріоритет</Text>

          <View style={tw`flex-row flex-wrap gap-2`}>
            {priorities.map((p) => {
              const isSelected = priority === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setPriority(p.id as any)}
                  style={tw`flex-1 min-w-36`}
                >
                  <Card
                    style={tw`border-2 ${
                      isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <View style={tw`items-center py-3`}>
                      <View
                        style={tw.style('w-10 h-10 rounded-full items-center justify-center mb-2', {
                          backgroundColor: p.color + '20',
                        })}
                      >
                        <Flag size={20} color={p.color} fill={p.color} />
                      </View>
                      <Text
                        style={tw`text-sm font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-700'
                        }`}
                      >
                        {p.label}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card style={tw`mb-4`}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>Термін виконання</Text>

          <DateTimePicker
            label="Дата та час"
            value={dueDate}
            onChange={setDueDate}
            placeholder="Виберіть термін"
            mode="datetime"
            minimumDate={new Date()}
          />

          {dueDate && (
            <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3`}>
              <View style={tw`flex-row items-center`}>
                <Clock size={16} color="#0284c7" />
                <Text style={tw`text-sm text-blue-800 ml-2`}>
                  Push-нагадування буде надіслано за 1 годину до терміну
                </Text>
              </View>
            </View>
          )}
        </Card>

        {members.length > 0 && (
          <Card style={tw`mb-4`}>
            <Text style={tw`text-base font-semibold text-gray-900 mb-3`}>
              Призначити виконавця
            </Text>

            <View style={tw`gap-2`}>
              <TouchableOpacity
                onPress={() => setAssignedTo(null)}
                style={tw`flex-row items-center p-3 rounded-lg border ${
                  assignedTo === null
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <View style={tw`w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-3`}>
                  <User size={16} color="#6b7280" />
                </View>
                <Text
                  style={tw`text-sm font-medium ${
                    assignedTo === null ? 'text-blue-900' : 'text-gray-700'
                  }`}
                >
                  Не призначено
                </Text>
              </TouchableOpacity>

              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => setAssignedTo(member.id)}
                  style={tw`flex-row items-center p-3 rounded-lg border ${
                    assignedTo === member.id
                      ? 'bg-blue-50 border-blue-600'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <View style={tw`w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3`}>
                    <Text style={tw`text-sm font-semibold text-purple-700`}>
                      {member.full_name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={tw`text-sm font-medium ${
                      assignedTo === member.id ? 'text-blue-900' : 'text-gray-700'
                    }`}
                  >
                    {member.full_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        <Button title="Створити завдання" onPress={handleSave} loading={saving} fullWidth />
      </ScrollView>
    </View>
  );
}
