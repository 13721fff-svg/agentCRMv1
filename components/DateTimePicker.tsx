import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import tw from '@/lib/tw';

interface DateTimePickerComponentProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  disabled?: boolean;
  placeholder?: string;
}

export default function DateTimePickerComponent({
  label,
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
  disabled = false,
  placeholder = 'Виберіть дату',
}: DateTimePickerComponentProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const formatDate = (date: Date): string => {
    if (mode === 'time') {
      return date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (mode === 'date') {
      return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        onChange(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShowPicker(false);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={tw`mb-4`}>
        <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>{label}</Text>
        <View style={tw`flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-white`}>
          {mode === 'time' ? (
            <Clock size={20} color="#737373" style={tw`mr-2`} />
          ) : (
            <Calendar size={20} color="#737373" style={tw`mr-2`} />
          )}
          <input
            type={mode === 'time' ? 'time' : mode === 'date' ? 'date' : 'datetime-local'}
            placeholder={placeholder}
            value={
              value
                ? mode === 'time'
                  ? value.toTimeString().slice(0, 5)
                  : mode === 'date'
                  ? value.toISOString().slice(0, 10)
                  : value.toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                onChange(newDate);
              }
            }}
            disabled={disabled}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              color: '#171717',
              backgroundColor: 'transparent',
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>{label}</Text>
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        style={tw`flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-white ${
          disabled ? 'opacity-50' : ''
        }`}
        disabled={disabled}
      >
        {mode === 'time' ? (
          <Clock size={20} color="#737373" style={tw`mr-2`} />
        ) : (
          <Calendar size={20} color="#737373" style={tw`mr-2`} />
        )}
        <Text style={tw`text-base ${value ? 'text-gray-900' : 'text-gray-500'} flex-1`}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <>
          <DateTimePicker
            value={tempDate}
            mode={mode === 'datetime' ? 'date' : mode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            minimumDate={minimumDate}
          />

          {Platform.OS === 'ios' && mode === 'datetime' && (
            <View style={tw`mt-2 flex-row gap-2`}>
              <TouchableOpacity
                onPress={handleCancel}
                style={tw`flex-1 bg-gray-200 py-3 rounded-lg`}
              >
                <Text style={tw`text-center text-gray-700 font-medium`}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={tw`flex-1 bg-blue-600 py-3 rounded-lg`}
              >
                <Text style={tw`text-center text-white font-medium`}>Підтвердити</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
