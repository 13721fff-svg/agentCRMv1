import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { DateData } from 'react-native-calendars';
import { Plus, Calendar, List, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CalendarView from '@/components/CalendarView';
import { useMeetingsStore } from '@/store/meetingsStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function MeetingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { meetings, setMeetings } = useMeetingsStore();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('org_id', user?.org_id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      setMeetings(data || []);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (date: DateData) => {
    setSelectedDate(date.dateString);
  };

  const getMeetingsForDate = (date: string) => {
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.start_time).toISOString().split('T')[0];
      return meetingDate === date;
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#22c55e" />;
      case 'cancelled':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#0284c7" />;
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

  const selectedDateMeetings = getMeetingsForDate(selectedDate);

  const renderListView = () => {
    const groupedMeetings: { [key: string]: any[] } = {};

    meetings.forEach((meeting) => {
      const date = new Date(meeting.start_time).toISOString().split('T')[0];
      if (!groupedMeetings[date]) {
        groupedMeetings[date] = [];
      }
      groupedMeetings[date].push(meeting);
    });

    const sortedDates = Object.keys(groupedMeetings).sort();

    return (
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4 pb-24`}>
        {sortedDates.map((date) => (
          <View key={date} style={tw`mb-4`}>
            <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
              {new Date(date).toLocaleDateString('uk-UA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {groupedMeetings[date].map((meeting) => (
              <TouchableOpacity
                key={meeting.id}
                onPress={() => router.push(`/meetings/${meeting.id}`)}
              >
                <Card style={tw`mb-3`}>
                  <View style={tw`flex-row items-start justify-between mb-2`}>
                    <Text style={tw`text-lg font-semibold text-gray-900 flex-1`}>
                      {meeting.title}
                    </Text>
                    {getStatusIcon(meeting.status)}
                  </View>

                  <View style={tw`flex-row items-center mb-2`}>
                    <Clock size={14} color="#6b7280" />
                    <Text style={tw`text-sm text-gray-600 ml-1`}>
                      {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                    </Text>
                  </View>

                  {meeting.location && (
                    <View style={tw`flex-row items-center mb-2`}>
                      <MapPin size={14} color="#6b7280" />
                      <Text style={tw`text-sm text-gray-600 ml-1`}>{meeting.location}</Text>
                    </View>
                  )}

                  <View style={tw`flex-row items-center`}>
                    <View
                      style={tw`px-2 py-1 rounded-full ${getStatusColor(meeting.status)}`}
                    >
                      <Text style={tw`text-xs font-medium`}>
                        {getStatusText(meeting.status)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderCalendarView = () => (
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4 pb-24`}>
      <CalendarView
        meetings={meetings}
        onDayPress={handleDayPress}
        selectedDate={selectedDate}
      />

      <View style={tw`mb-3`}>
        <Text style={tw`text-lg font-semibold text-gray-900 mb-2`}>
          {new Date(selectedDate).toLocaleDateString('uk-UA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={tw`text-sm text-gray-600`}>
          {selectedDateMeetings.length === 0
            ? 'Немає зустрічей'
            : `${selectedDateMeetings.length} ${
                selectedDateMeetings.length === 1 ? 'зустріч' : 'зустрічі'
              }`}
        </Text>
      </View>

      {selectedDateMeetings.length === 0 ? (
        <Card>
          <Text style={tw`text-center text-gray-500 py-4`}>
            Немає зустрічей на цю дату
          </Text>
        </Card>
      ) : (
        selectedDateMeetings.map((meeting) => (
          <TouchableOpacity
            key={meeting.id}
            onPress={() => router.push(`/meetings/${meeting.id}`)}
          >
            <Card style={tw`mb-3`}>
              <View style={tw`flex-row items-start justify-between mb-2`}>
                <Text style={tw`text-lg font-semibold text-gray-900 flex-1`}>
                  {meeting.title}
                </Text>
                {getStatusIcon(meeting.status)}
              </View>

              <View style={tw`flex-row items-center mb-2`}>
                <Clock size={14} color="#6b7280" />
                <Text style={tw`text-sm text-gray-600 ml-1`}>
                  {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                </Text>
              </View>

              {meeting.location && (
                <View style={tw`flex-row items-center mb-2`}>
                  <MapPin size={14} color="#6b7280" />
                  <Text style={tw`text-sm text-gray-600 ml-1`}>{meeting.location}</Text>
                </View>
              )}

              <View style={tw`flex-row items-center`}>
                <View style={tw`px-2 py-1 rounded-full ${getStatusColor(meeting.status)}`}>
                  <Text style={tw`text-xs font-medium`}>
                    {getStatusText(meeting.status)}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={tw`flex-1 bg-neutral-50`}>
        <Header title="Зустрічі" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title="Зустрічі"
        showBack
        rightAction={
          <View style={tw`flex-row items-center gap-3`}>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            >
              {viewMode === 'calendar' ? (
                <List size={24} color="#0284c7" />
              ) : (
                <Calendar size={24} color="#0284c7" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/meetings/create')}>
              <Plus size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>
        }
      />

      {meetings.length === 0 ? (
        <ScrollView contentContainerStyle={tw`flex-1 p-4`}>
          <EmptyState
            icon={<Calendar size={48} color="#a3a3a3" />}
            title="Немає зустрічей"
            description="Створіть першу зустріч для планування"
            action={
              <Button
                title="Створити зустріч"
                onPress={() => router.push('/meetings/create')}
              />
            }
          />
        </ScrollView>
      ) : (
        <>{viewMode === 'calendar' ? renderCalendarView() : renderListView()}</>
      )}
    </View>
  );
}
