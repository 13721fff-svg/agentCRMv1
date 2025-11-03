import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Calendar, DollarSign, Users, Tag } from 'lucide-react-native';
import tw from '@/lib/tw';
import Button from './Button';
import Card from './Card';

export interface FilterOptions {
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  amountRange?: {
    min: number | null;
    max: number | null;
  };
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  tags?: string[];
}

interface AdvancedFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  availableStatuses?: Array<{ value: string; label: string }>;
  availablePriorities?: Array<{ value: string; label: string }>;
  availableUsers?: Array<{ id: string; name: string }>;
  availableTags?: string[];
}

export default function AdvancedFilters({
  visible,
  onClose,
  onApply,
  currentFilters,
  availableStatuses = [],
  availablePriorities = [],
  availableUsers = [],
  availableTags = [],
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: FilterOptions = {
      dateRange: { from: null, to: null },
      amountRange: { min: null, max: null },
      status: [],
      priority: [],
      assignedTo: [],
      tags: [],
    };
    setFilters(emptyFilters);
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const current = (filters[key] as string[]) || [];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: newValue });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
        <View style={tw`bg-white rounded-t-3xl h-5/6`}>
          <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}>
            <Text style={tw`text-xl font-bold text-gray-900`}>Розширені фільтри</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={tw`p-4`}>
            {availableStatuses.length > 0 && (
              <Card style={tw`mb-4`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Tag size={20} color="#0284c7" />
                  <Text style={tw`text-base font-semibold text-gray-900 ml-2`}>Статус</Text>
                </View>
                <View style={tw`flex-row flex-wrap`}>
                  {availableStatuses.map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      onPress={() => toggleArrayFilter('status', status.value)}
                      style={[
                        tw`px-4 py-2 rounded-full mr-2 mb-2`,
                        (filters.status || []).includes(status.value)
                          ? tw`bg-blue-600`
                          : tw`bg-gray-100`,
                      ]}
                    >
                      <Text
                        style={tw`text-sm font-medium ${
                          (filters.status || []).includes(status.value)
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            )}

            {availablePriorities.length > 0 && (
              <Card style={tw`mb-4`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Tag size={20} color="#f59e0b" />
                  <Text style={tw`text-base font-semibold text-gray-900 ml-2`}>Пріоритет</Text>
                </View>
                <View style={tw`flex-row flex-wrap`}>
                  {availablePriorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.value}
                      onPress={() => toggleArrayFilter('priority', priority.value)}
                      style={[
                        tw`px-4 py-2 rounded-full mr-2 mb-2`,
                        (filters.priority || []).includes(priority.value)
                          ? tw`bg-orange-600`
                          : tw`bg-gray-100`,
                      ]}
                    >
                      <Text
                        style={tw`text-sm font-medium ${
                          (filters.priority || []).includes(priority.value)
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            )}

            {availableUsers.length > 0 && (
              <Card style={tw`mb-4`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Users size={20} color="#8b5cf6" />
                  <Text style={tw`text-base font-semibold text-gray-900 ml-2`}>
                    Виконавець
                  </Text>
                </View>
                <View style={tw`flex-row flex-wrap`}>
                  {availableUsers.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      onPress={() => toggleArrayFilter('assignedTo', user.id)}
                      style={[
                        tw`px-4 py-2 rounded-full mr-2 mb-2`,
                        (filters.assignedTo || []).includes(user.id)
                          ? tw`bg-purple-600`
                          : tw`bg-gray-100`,
                      ]}
                    >
                      <Text
                        style={tw`text-sm font-medium ${
                          (filters.assignedTo || []).includes(user.id)
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {user.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            )}

            {availableTags.length > 0 && (
              <Card style={tw`mb-4`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Tag size={20} color="#16a34a" />
                  <Text style={tw`text-base font-semibold text-gray-900 ml-2`}>Теги</Text>
                </View>
                <View style={tw`flex-row flex-wrap`}>
                  {availableTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleArrayFilter('tags', tag)}
                      style={[
                        tw`px-4 py-2 rounded-full mr-2 mb-2`,
                        (filters.tags || []).includes(tag)
                          ? tw`bg-green-600`
                          : tw`bg-gray-100`,
                      ]}
                    >
                      <Text
                        style={tw`text-sm font-medium ${
                          (filters.tags || []).includes(tag) ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            )}
          </ScrollView>

          <View style={tw`p-4 border-t border-gray-200 flex-row gap-3`}>
            <Button
              title="Скинути"
              onPress={handleReset}
              variant="outline"
              style={tw`flex-1`}
            />
            <Button title="Застосувати" onPress={handleApply} style={tw`flex-1`} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
