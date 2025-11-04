import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import tw from '@/lib/tw';

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface CalendarViewProps {
  meetings: Meeting[];
  onDayPress: (date: { dateString: string }) => void;
  selectedDate?: string;
}

export default function CalendarView({ meetings, onDayPress, selectedDate }: CalendarViewProps) {
  const getMeetingsForDate = (date: string) => {
    const meetingsForDate = meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.start_time).toISOString().split('T')[0];
      return meetingDate === date;
    });
    return meetingsForDate;
  };

  return (
    <View style={tw`bg-white rounded-lg mb-4 overflow-hidden`}>
      <DateTimePicker
        mode="single"
        date={selectedDate ? dayjs(selectedDate).toDate() : undefined}
        onChange={(params) => {
          if (params.date) {
            const dateString = dayjs(params.date).format('YYYY-MM-DD');
            onDayPress({ dateString });
          }
        }}
      />

      <View style={tw`p-4 border-t border-gray-200`}>
        <View style={tw`flex-row justify-around`}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-3 h-3 rounded-full bg-blue-600 mr-2`} />
            <Text style={tw`text-xs text-gray-600`}>Заплановано</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-3 h-3 rounded-full bg-green-600 mr-2`} />
            <Text style={tw`text-xs text-gray-600`}>Завершено</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-3 h-3 rounded-full bg-red-600 mr-2`} />
            <Text style={tw`text-xs text-gray-600`}>Скасовано</Text>
          </View>
        </View>

        {selectedDate && (
          <View style={tw`mt-4 pt-4 border-t border-gray-100`}>
            <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
              {dayjs(selectedDate).format('D MMMM YYYY')}
            </Text>
            {getMeetingsForDate(selectedDate).map((meeting) => {
              const color = meeting.status === 'completed' ? 'bg-green-100 border-green-500' :
                           meeting.status === 'cancelled' ? 'bg-red-100 border-red-500' :
                           'bg-blue-100 border-blue-500';

              return (
                <View
                  key={meeting.id}
                  style={tw`mb-2 p-2 rounded-lg border-l-4 ${color}`}
                >
                  <Text style={tw`text-sm font-medium text-gray-900`}>
                    {meeting.title}
                  </Text>
                  <Text style={tw`text-xs text-gray-600 mt-1`}>
                    {dayjs(meeting.start_time).format('HH:mm')} - {dayjs(meeting.end_time).format('HH:mm')}
                  </Text>
                </View>
              );
            })}
            {getMeetingsForDate(selectedDate).length === 0 && (
              <Text style={tw`text-sm text-gray-500 italic`}>
                Немає зустрічей на цю дату
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
