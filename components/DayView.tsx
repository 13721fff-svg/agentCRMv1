import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import tw from '@/lib/tw';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface DayViewProps {
  meetings: Meeting[];
  selectedDate: Date;
  onMeetingPress: (meetingId: string) => void;
}

export default function DayView({ meetings, selectedDate, onMeetingPress }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getMeetingsForHour = (hour: number) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return meetings.filter((m) => {
      const meetingDate = new Date(m.start_time);
      const meetingDateStr = meetingDate.toISOString().split('T')[0];
      const meetingHour = meetingDate.getHours();
      return meetingDateStr === dateStr && meetingHour === hour;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-500';
      case 'cancelled':
        return 'bg-red-100 border-red-500';
      default:
        return 'bg-blue-100 border-blue-500';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentHour = new Date().getHours();
  const isToday =
    new Date().toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];

  return (
    <View style={tw`bg-white rounded-lg mb-4`}>
      <View style={tw`p-4 border-b border-gray-200`}>
        <Text style={tw`text-lg font-bold text-gray-900`}>
          {selectedDate.toLocaleDateString('uk-UA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <ScrollView style={tw`max-h-120`}>
        {hours.map((hour) => {
          const hourMeetings = getMeetingsForHour(hour);
          const isCurrentHour = isToday && hour === currentHour;

          return (
            <View
              key={hour}
              style={tw`flex-row border-b border-gray-100 ${isCurrentHour ? 'bg-blue-50' : ''}`}
            >
              <View style={tw`w-16 p-2 border-r border-gray-200`}>
                <Text
                  style={tw`text-xs font-medium ${
                    isCurrentHour ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {hour.toString().padStart(2, '0')}:00
                </Text>
              </View>

              <View style={tw`flex-1 p-2 min-h-16`}>
                {hourMeetings.length > 0 ? (
                  hourMeetings.map((meeting) => (
                    <TouchableOpacity
                      key={meeting.id}
                      onPress={() => onMeetingPress(meeting.id)}
                      style={tw`${getStatusColor(
                        meeting.status
                      )} border-l-4 rounded-lg p-3 mb-2`}
                    >
                      <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                        {meeting.title}
                      </Text>

                      <View style={tw`flex-row items-center mb-1`}>
                        <Clock size={14} color="#6b7280" />
                        <Text style={tw`text-sm text-gray-600 ml-1`}>
                          {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                        </Text>
                      </View>

                      {meeting.location && (
                        <View style={tw`flex-row items-center mb-1`}>
                          <MapPin size={14} color="#6b7280" />
                          <Text style={tw`text-sm text-gray-600 ml-1`} numberOfLines={1}>
                            {meeting.location}
                          </Text>
                        </View>
                      )}

                      {meeting.description && (
                        <Text style={tw`text-sm text-gray-700 mt-1`} numberOfLines={2}>
                          {meeting.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={tw`h-full justify-center`}>
                    <Text style={tw`text-xs text-gray-400`}>Немає зустрічей</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
