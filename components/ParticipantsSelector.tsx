import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Users, X, Search } from 'lucide-react-native';
import tw from '@/lib/tw';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface TeamMember {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
}

interface ParticipantsSelectorProps {
  selectedParticipants: string[];
  onParticipantsChange: (participants: string[]) => void;
  label?: string;
}

export default function ParticipantsSelector({
  selectedParticipants,
  onParticipantsChange,
  label = 'Учасники',
}: ParticipantsSelectorProps) {
  const user = useAuthStore((state) => state.user);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('org_id', user?.org_id)
        .order('full_name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter((member) =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleParticipant = (memberId: string) => {
    if (selectedParticipants.includes(memberId)) {
      onParticipantsChange(selectedParticipants.filter((id) => id !== memberId));
    } else {
      onParticipantsChange([...selectedParticipants, memberId]);
    }
  };

  const getSelectedMembersNames = () => {
    return teamMembers
      .filter((m) => selectedParticipants.includes(m.id))
      .map((m) => m.full_name)
      .join(', ');
  };

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>{label}</Text>

      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        style={tw`flex-row items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-white`}
      >
        <View style={tw`flex-row items-center flex-1`}>
          <Users size={20} color="#737373" style={tw`mr-2`} />
          <Text style={tw`text-base ${selectedParticipants.length > 0 ? 'text-gray-900' : 'text-gray-400'} flex-1`} numberOfLines={1}>
            {selectedParticipants.length > 0
              ? getSelectedMembersNames()
              : 'Оберіть учасників'}
          </Text>
        </View>
        <View style={tw`bg-blue-100 px-2 py-1 rounded-full ml-2`}>
          <Text style={tw`text-xs font-medium text-blue-800`}>
            {selectedParticipants.length}
          </Text>
        </View>
      </TouchableOpacity>

      {showDropdown && (
        <View style={tw`mt-2 border border-gray-200 rounded-lg bg-white overflow-hidden`}>
          <View style={tw`p-3 border-b border-gray-200`}>
            <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3 py-2`}>
              <Search size={16} color="#6b7280" />
              <TextInput
                style={tw`flex-1 ml-2 text-base text-gray-900`}
                placeholder="Пошук учасників..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView style={tw`max-h-60`}>
            {loading ? (
              <View style={tw`p-4 items-center`}>
                <ActivityIndicator size="small" color="#0284c7" />
              </View>
            ) : filteredMembers.length === 0 ? (
              <View style={tw`p-4`}>
                <Text style={tw`text-center text-gray-500`}>
                  {searchQuery ? 'Учасників не знайдено' : 'Немає членів команди'}
                </Text>
              </View>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = selectedParticipants.includes(member.id);
                return (
                  <TouchableOpacity
                    key={member.id}
                    onPress={() => toggleParticipant(member.id)}
                    style={tw`flex-row items-center justify-between px-4 py-3 border-b border-gray-100 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-base font-medium text-gray-900`}>
                        {member.full_name}
                      </Text>
                      {member.email && (
                        <Text style={tw`text-sm text-gray-500 mt-0.5`}>
                          {member.email}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <View style={tw`bg-blue-600 rounded-full p-1`}>
                        <X size={14} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
