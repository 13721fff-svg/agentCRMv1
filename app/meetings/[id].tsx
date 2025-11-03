import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, Calendar, Clock, MapPin, FileText, CheckCircle, XCircle, Edit2, User, Users } from 'lucide-react-native';
import { useMeetingsStore } from '@/store/meetingsStore';
import { supabase } from '@/lib/supabase';
import tw from '@/lib/tw';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Map from '@/components/Map';
import { MeetingStatus } from '@/types';

function MeetingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientName, setClientName] = useState<string | null>(null);
  const [participantsNames, setParticipantsNames] = useState<string[]>([]);
  const { deleteMeeting, updateMeeting } = useMeetingsStore();

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setMeeting(data);

      if (data?.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('full_name')
          .eq('id', data.client_id)
          .maybeSingle();

        if (client) setClientName(client.full_name);
      }

      if (data?.participants && data.participants.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('full_name')
          .in('id', data.participants);

        if (users) setParticipantsNames(users.map((u) => u.full_name));
      }
    } catch (error) {
      console.error('Error loading meeting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Видалити зустріч?', 'Цю дію неможливо скасувати', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('meetings').delete().eq('id', id);
            if (error) throw error;
            deleteMeeting(id);
            router.back();
          } catch (error) {
            Alert.alert('Помилка', 'Помилка видалення');
          }
        },
      },
    ]);
  };

  const handleChangeStatus = async (newStatus: MeetingStatus) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMeeting({ ...meeting, status: newStatus });
      updateMeeting(id, { status: newStatus });
      Alert.alert('Успіх', 'Статус зустрічі оновлено');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося оновити статус');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = () => {
    if (!meeting) return '';
    const start = new Date(meeting.start_time);
    const end = new Date(meeting.end_time);
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes} хв`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} год ${remainingMinutes} хв` : `${hours} год`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Скасовано';
      default:
        return 'Заплановано';
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <Text style={tw`text-gray-500`}>Зустріч не знайдено</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <View style={tw`bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`flex-row items-center flex-1`}>
          <ArrowLeft size={24} color="#374151" />
          <Text style={tw`ml-2 text-lg font-semibold text-gray-900 flex-1`} numberOfLines={1}>
            Зустріч
          </Text>
        </TouchableOpacity>
        <View style={tw`flex-row gap-3`}>
          {meeting.status === 'scheduled' && (
            <TouchableOpacity onPress={() => router.push(`/meetings/edit/${id}`)}>
              <Edit2 size={20} color="#0284c7" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4 pb-24`}>
        <Card style={tw`mb-4`}>
          <View style={tw`flex-row items-start justify-between mb-3`}>
            <Text style={tw`text-2xl font-bold text-gray-900 flex-1`}>{meeting.title}</Text>
            <View style={tw`px-3 py-1 rounded-full ${getStatusColor(meeting.status)}`}>
              <Text style={tw`text-xs font-medium`}>{getStatusText(meeting.status)}</Text>
            </View>
          </View>

          {meeting.description && (
            <View style={tw`mb-4`}>
              <Text style={tw`text-base text-gray-700 leading-6`}>{meeting.description}</Text>
            </View>
          )}

          <View style={tw`border-t border-gray-200 pt-4`}>
            <View style={tw`flex-row items-start mb-3`}>
              <Calendar size={20} color="#0284c7" style={tw`mr-3 mt-1`} />
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-gray-500 mb-1`}>Дата початку</Text>
                <Text style={tw`text-base text-gray-900`}>{formatDateTime(meeting.start_time)}</Text>
              </View>
            </View>

            <View style={tw`flex-row items-start mb-3`}>
              <Calendar size={20} color="#0284c7" style={tw`mr-3 mt-1`} />
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-gray-500 mb-1`}>Дата закінчення</Text>
                <Text style={tw`text-base text-gray-900`}>{formatDateTime(meeting.end_time)}</Text>
              </View>
            </View>

            <View style={tw`flex-row items-start mb-3`}>
              <Clock size={20} color="#22c55e" style={tw`mr-3 mt-1`} />
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-gray-500 mb-1`}>Тривалість</Text>
                <Text style={tw`text-base text-gray-900`}>{getDuration()}</Text>
              </View>
            </View>

            {meeting.location && (
              <View style={tw`flex-row items-start mb-3`}>
                <MapPin size={20} color="#ef4444" style={tw`mr-3 mt-1`} />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>Локація</Text>
                  <Text style={tw`text-base text-gray-900`}>{meeting.location}</Text>
                </View>
              </View>
            )}

            {clientName && (
              <View style={tw`flex-row items-start mb-3`}>
                <User size={20} color="#8b5cf6" style={tw`mr-3 mt-1`} />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>Клієнт</Text>
                  <Text style={tw`text-base text-gray-900`}>{clientName}</Text>
                </View>
              </View>
            )}

            {participantsNames.length > 0 && (
              <View style={tw`flex-row items-start`}>
                <Users size={20} color="#0284c7" style={tw`mr-3 mt-1`} />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Учасники ({participantsNames.length})
                  </Text>
                  {participantsNames.map((name, index) => (
                    <Text key={index} style={tw`text-base text-gray-900`}>
                      • {name}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Card>

        {meeting.latitude && meeting.longitude && (
          <Card style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-gray-500 mb-3`}>Місце на карті</Text>
            <Map
              latitude={meeting.latitude}
              longitude={meeting.longitude}
              showCurrentLocation={false}
              height={200}
            />
          </Card>
        )}

        {meeting.status === 'scheduled' && (
          <Card style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-gray-700 mb-3`}>Змінити статус</Text>
            <View style={tw`flex-row gap-2`}>
              <Button
                title="✓ Завершено"
                onPress={() => handleChangeStatus('completed')}
                variant="outline"
                style={tw`flex-1`}
              />
              <Button
                title="✗ Скасовано"
                onPress={() => handleChangeStatus('cancelled')}
                variant="outline"
                style={tw`flex-1`}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

export default MeetingDetailsScreen;
