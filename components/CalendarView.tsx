import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
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
  onDayPress: (date: DateData) => void;
  selectedDate?: string;
}

export default function CalendarView({ meetings, onDayPress, selectedDate }: CalendarViewProps) {
  const markedDates = React.useMemo(() => {
    const marked: any = {};

    meetings.forEach((meeting) => {
      const date = new Date(meeting.start_time).toISOString().split('T')[0];

      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dots: [],
        };
      }

      const color = meeting.status === 'completed' ? '#22c55e' :
                   meeting.status === 'cancelled' ? '#ef4444' :
                   '#0284c7';

      marked[date].dots.push({ color });
    });

    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = { selected: true };
    } else if (selectedDate) {
      marked[selectedDate] = { ...marked[selectedDate], selected: true };
    }

    return marked;
  }, [meetings, selectedDate]);

  if (Platform.OS === 'web') {
    return (
      <View style={tw`bg-white rounded-lg p-4 mb-4`}>
        <Text style={tw`text-center text-gray-600`}>
          Календар доступний тільки на iOS та Android
        </Text>
        <Text style={tw`text-center text-gray-500 text-sm mt-2`}>
          У вас є {meetings.length} запланованих зустрічей
        </Text>
      </View>
    );
  }

  return (
    <View style={tw`bg-white rounded-lg mb-4 overflow-hidden`}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#737373',
          selectedDayBackgroundColor: '#0284c7',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#0284c7',
          dayTextColor: '#171717',
          textDisabledColor: '#d4d4d4',
          dotColor: '#0284c7',
          selectedDotColor: '#ffffff',
          arrowColor: '#0284c7',
          monthTextColor: '#171717',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '400',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        firstDay={1}
        enableSwipeMonths={true}
      />

      <View style={tw`p-4 border-t border-gray-200 flex-row justify-around`}>
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
    </View>
  );
}
