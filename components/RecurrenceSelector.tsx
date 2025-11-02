import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Repeat } from 'lucide-react-native';
import tw from '@/lib/tw';
import { RecurrenceFrequency } from '@/types';
import DateTimePickerComponent from './DateTimePicker';

interface RecurrenceSelectorProps {
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceEndDate: Date | null;
  onRecurrenceChange: (frequency: RecurrenceFrequency) => void;
  onEndDateChange: (date: Date | null) => void;
}

export default function RecurrenceSelector({
  recurrenceFrequency,
  recurrenceEndDate,
  onRecurrenceChange,
  onEndDateChange,
}: RecurrenceSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const frequencies: { value: RecurrenceFrequency; label: string }[] = [
    { value: 'none', label: 'Не повторювати' },
    { value: 'daily', label: 'Щодня' },
    { value: 'weekly', label: 'Щотижня' },
    { value: 'monthly', label: 'Щомісяця' },
  ];

  const getFrequencyLabel = () => {
    return frequencies.find((f) => f.value === recurrenceFrequency)?.label || 'Не повторювати';
  };

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Повторення</Text>

      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        style={tw`flex-row items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-white`}
      >
        <View style={tw`flex-row items-center flex-1`}>
          <Repeat size={20} color="#737373" style={tw`mr-2`} />
          <Text style={tw`text-base text-gray-900`}>{getFrequencyLabel()}</Text>
        </View>
      </TouchableOpacity>

      {showDropdown && (
        <View style={tw`mt-2 border border-gray-200 rounded-lg bg-white overflow-hidden`}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq.value}
              onPress={() => {
                onRecurrenceChange(freq.value);
                setShowDropdown(false);
                if (freq.value === 'none') {
                  onEndDateChange(null);
                }
              }}
              style={tw`px-4 py-3 border-b border-gray-100 ${
                recurrenceFrequency === freq.value ? 'bg-blue-50' : ''
              }`}
            >
              <Text
                style={tw`text-base ${
                  recurrenceFrequency === freq.value ? 'text-blue-600 font-medium' : 'text-gray-900'
                }`}
              >
                {freq.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {recurrenceFrequency !== 'none' && (
        <View style={tw`mt-3`}>
          <DateTimePickerComponent
            label="Закінчити повторення"
            value={recurrenceEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            onChange={(date) => onEndDateChange(date)}
            mode="date"
            minimumDate={new Date()}
          />
        </View>
      )}
    </View>
  );
}
