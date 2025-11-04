import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Calendar, List, Clock, MapPin, CheckCircle, XCircle, Search, Filter, X, Download } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CalendarView from '@/components/CalendarView';
import WeekView from '@/components/WeekView';
import DayView from '@/components/DayView';
import { useMeetingsStore } from '@/store/meetingsStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { realtimeService } from '@/services/realtimeService';
import { exportService } from '@/services/exportService';
import { Alert } from 'react-native';

export default function MeetingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useThemedStyles();
  const user = useAuthStore((state) => state.user);
  const { meetings, setMeetings } = useMeetingsStore();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    if (!user?.org_id) return;

    const unsubscribe = realtimeService.subscribe('meetings', user.org_id, {
      onInsert: (newMeeting) => setMeetings([newMeeting, ...meetings]),
      onUpdate: (updated) => setMeetings(meetings.map((m) => (m.id === updated.id ? updated : m))),
      onDelete: (deleted) => setMeetings(meetings.filter((m) => m.id !== deleted.id)),
    });

    return () => unsubscribe();
  }, [user?.org_id, meetings]);

  const loadMeetings = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('meetings')
        .select('*');

      if (user?.org_id) {
        query = query.eq('org_id', user.org_id);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;

      setMeetings(data || []);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (date: { dateString: string }) => {
    setSelectedDate(date.dateString);
  };

  const getFilteredMeetings = () => {
    return meetings.filter((meeting) => {
      const matchesSearch = !searchQuery ||
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || meeting.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const getMeetingsForDate = (date: string) => {
    const filtered = getFilteredMeetings();
    return filtered.filter((meeting) => {
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
    const filteredMeetings = getFilteredMeetings();

    filteredMeetings.forEach((meeting) => {
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

  const renderMonthView = () => (
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

  const renderWeekView = () => (
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4 pb-24`}>
      <WeekView
        meetings={getFilteredMeetings()}
        selectedDate={new Date(selectedDate)}
        onDateChange={(date) => setSelectedDate(date.toISOString().split('T')[0])}
        onMeetingPress={(id) => router.push(`/meetings/${id}`)}
      />

      {selectedDateMeetings.length > 0 && (
        <View style={tw`mt-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
            Зустрічі на цей день
          </Text>
          {selectedDateMeetings.map((meeting) => (
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
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderDayView = () => (
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4 pb-24`}>
      <DayView
        meetings={getFilteredMeetings()}
        selectedDate={new Date(selectedDate)}
        onMeetingPress={(id) => router.push(`/meetings/${id}`)}
      />
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={tw`flex-1 bg-neutral-50`}>
        <Header title={t('meetings.title')} showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header
        title={t('meetings.title')}
        showBack
        rightAction={
          <View style={tw`flex-row items-center gap-3`}>
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <Filter size={24} color={showFilters || statusFilter ? '#0284c7' : '#737373'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/map/meetings')}>
              <MapPin size={24} color="#0284c7" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/meetings/create')}>
              <Plus size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={tw`bg-white px-4 py-2 border-b border-gray-200 flex-row justify-center gap-2`}>
        <TouchableOpacity
          onPress={() => setViewMode('month')}
          style={tw`px-4 py-2 rounded-lg ${viewMode === 'month' ? 'bg-blue-600' : 'bg-gray-100'}`}
        >
          <Text style={tw`text-xs font-medium ${viewMode === 'month' ? 'text-white' : 'text-gray-700'}`}>
            Місяць
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('week')}
          style={tw`px-4 py-2 rounded-lg ${viewMode === 'week' ? 'bg-blue-600' : 'bg-gray-100'}`}
        >
          <Text style={tw`text-xs font-medium ${viewMode === 'week' ? 'text-white' : 'text-gray-700'}`}>
            Тиждень
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('day')}
          style={tw`px-4 py-2 rounded-lg ${viewMode === 'day' ? 'bg-blue-600' : 'bg-gray-100'}`}
        >
          <Text style={tw`text-xs font-medium ${viewMode === 'day' ? 'text-white' : 'text-gray-700'}`}>
            День
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('list')}
          style={tw`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-100'}`}
        >
          <Text style={tw`text-xs font-medium ${viewMode === 'list' ? 'text-white' : 'text-gray-700'}`}>
            Список
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={tw`bg-white px-4 py-3 border-b border-gray-200`}>
          <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3`}>
            <Search size={16} color="#6b7280" />
            <TextInput
              style={tw`flex-1 ml-2 text-base text-gray-900`}
              placeholder="Пошук зустрічей..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          <View style={tw`flex-row flex-wrap gap-2`}>
            <TouchableOpacity
              onPress={() => setStatusFilter(null)}
              style={tw`px-3 py-2 rounded-full ${
                !statusFilter ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <Text style={tw`text-xs font-medium ${!statusFilter ? 'text-white' : 'text-gray-700'}`}>
                Всі
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStatusFilter('scheduled')}
              style={tw`px-3 py-2 rounded-full ${
                statusFilter === 'scheduled' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <Text style={tw`text-xs font-medium ${statusFilter === 'scheduled' ? 'text-white' : 'text-gray-700'}`}>
                Заплановано
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStatusFilter('completed')}
              style={tw`px-3 py-2 rounded-full ${
                statusFilter === 'completed' ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <Text style={tw`text-xs font-medium ${statusFilter === 'completed' ? 'text-white' : 'text-gray-700'}`}>
                Завершено
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStatusFilter('cancelled')}
              style={tw`px-3 py-2 rounded-full ${
                statusFilter === 'cancelled' ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <Text style={tw`text-xs font-medium ${statusFilter === 'cancelled' ? 'text-white' : 'text-gray-700'}`}>
                Скасовано
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {meetings.length === 0 ? (
        <ScrollView contentContainerStyle={tw`flex-1 p-4`}>
          <EmptyState
            icon={<Calendar size={48} color="#a3a3a3" />}
            title={t('meetings.noMeetings')}
            description="Створіть першу зустріч для планування"
            action={
              <Button
                title={t('meetings.createMeeting')}
                onPress={() => router.push('/meetings/create')}
              />
            }
          />
        </ScrollView>
      ) : (
        <>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'list' && renderListView()}
        </>
      )}
    </View>
  );
}
