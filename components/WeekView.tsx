import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import tw from '@/lib/tw';

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface WeekViewProps {
  meetings: Meeting[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onMeetingPress: (meetingId: string) => void;
}

export default function WeekView({
  meetings,
  selectedDate,
  onDateChange,
  onMeetingPress,
}: WeekViewProps) {
  const getWeekDates = () => {
    const dates: Date[] = [];
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const getMeetingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter((m) => {
      const meetingDate = new Date(m.start_time).toISOString().split('T')[0];
      return meetingDate === dateStr;
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

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={tw`bg-white rounded-lg mb-4`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={tw`flex-row p-2`}>
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
            const dayMeetings = getMeetingsForDate(date);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => onDateChange(date)}
                style={tw`w-24 mr-2`}
              >
                <View
                  style={tw`border-2 rounded-lg p-2 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : isToday
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text
                    style={tw`text-xs text-center mb-1 ${
                      isSelected || isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {date.toLocaleDateString('uk-UA', { weekday: 'short' })}
                  </Text>
                  <Text
                    style={tw`text-2xl font-bold text-center mb-2 ${
                      isSelected || isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {date.getDate()}
                  </Text>

                  {dayMeetings.length > 0 ? (
                    <View>
                      {dayMeetings.slice(0, 2).map((meeting) => (
                        <TouchableOpacity
                          key={meeting.id}
                          onPress={() => onMeetingPress(meeting.id)}
                          style={tw`${getStatusColor(
                            meeting.status
                          )} border-l-4 rounded p-1 mb-1`}
                        >
                          <Text style={tw`text-xs text-gray-900 font-medium`} numberOfLines={1}>
                            {meeting.title}
                          </Text>
                          <View style={tw`flex-row items-center mt-0.5`}>
                            <Clock size={8} color="#6b7280" />
                            <Text style={tw`text-[10px] text-gray-600 ml-0.5`}>
                              {formatTime(meeting.start_time)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                      {dayMeetings.length > 2 && (
                        <Text style={tw`text-[10px] text-gray-500 text-center mt-1`}>
                          +{dayMeetings.length - 2} ще
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={tw`text-xs text-gray-400 text-center`}>Немає</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
