import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { User, X, Search } from 'lucide-react-native';
import tw from '@/lib/tw';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Client } from '@/types';

interface ClientSelectorProps {
  selectedClientId: string | null;
  onClientChange: (clientId: string | null) => void;
  label?: string;
}

export default function ClientSelector({
  selectedClientId,
  onClientChange,
  label = 'Клієнт',
}: ClientSelectorProps) {
  const user = useAuthStore((state) => state.user);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('org_id', user?.org_id)
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleSelect = (clientId: string) => {
    onClientChange(clientId);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onClientChange(null);
    setShowDropdown(false);
  };

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>{label}</Text>

      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        style={tw`flex-row items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-white`}
      >
        <View style={tw`flex-row items-center flex-1`}>
          <User size={20} color="#737373" style={tw`mr-2`} />
          <Text style={tw`text-base ${selectedClient ? 'text-gray-900' : 'text-gray-400'} flex-1`} numberOfLines={1}>
            {selectedClient ? selectedClient.full_name : 'Оберіть клієнта'}
          </Text>
        </View>
        {selectedClient && (
          <TouchableOpacity onPress={handleClear} style={tw`ml-2`}>
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {showDropdown && (
        <View style={tw`mt-2 border border-gray-200 rounded-lg bg-white overflow-hidden`}>
          <View style={tw`p-3 border-b border-gray-200`}>
            <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3 py-2`}>
              <Search size={16} color="#6b7280" />
              <TextInput
                style={tw`flex-1 ml-2 text-base text-gray-900`}
                placeholder="Пошук клієнтів..."
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
            ) : filteredClients.length === 0 ? (
              <View style={tw`p-4`}>
                <Text style={tw`text-center text-gray-500`}>
                  {searchQuery ? 'Клієнтів не знайдено' : 'Немає клієнтів'}
                </Text>
              </View>
            ) : (
              filteredClients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  onPress={() => handleSelect(client.id)}
                  style={tw`px-4 py-3 border-b border-gray-100 ${
                    selectedClientId === client.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <Text style={tw`text-base font-medium text-gray-900`}>
                    {client.full_name}
                  </Text>
                  {client.phone && (
                    <Text style={tw`text-sm text-gray-600 mt-0.5`}>
                      {client.phone}
                    </Text>
                  )}
                  {client.email && (
                    <Text style={tw`text-sm text-gray-500 mt-0.5`}>
                      {client.email}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
