import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Phone, Mail, Navigation, X } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { useAuthStore } from '@/store/authStore';
import { useClientsStore } from '@/store/clientsStore';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';

function ClientsMapScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { clients, setClients } = useClientsStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadClients();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);
    } catch (err) {
      console.error('Error getting location:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('org_id', user?.org_id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleNavigate = async (client: Client) => {
    if (!client.latitude || !client.longitude) return;

    const destination = `${client.latitude},${client.longitude}`;
    const label = encodeURIComponent(client.full_name);

    if (Platform.OS === 'ios') {
      const url = `maps://app?daddr=${destination}&dirflg=d`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(
          `http://maps.apple.com/?daddr=${destination}&dirflg=d&q=${label}`
        );
      }
    } else {
      const url = `google.navigation:q=${destination}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`
        );
      }
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={tw`flex-1 bg-white`}>
        <Header title="Клієнти на карті" showBack />
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <MapPin size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 text-center mt-4`}>
            Карта клієнтів доступна тільки на iOS та Android
          </Text>
        </View>
      </View>
    );
  }

  const clientsWithLocation = clients.filter(
    (c) => c.latitude && c.longitude
  );

  const initialRegion = {
    latitude: location?.coords.latitude || 50.4501,
    longitude: location?.coords.longitude || 30.5234,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header title="Клієнти на карті" showBack />

      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : clientsWithLocation.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <MapPin size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 text-center mt-4`}>
            Немає клієнтів з локацією
          </Text>
          <Text style={tw`text-sm text-gray-500 text-center mt-2`}>
            Додайте локацію до клієнтів, щоб побачити їх на карті
          </Text>
        </View>
      ) : (
        <>
          <MapView
            style={tw`flex-1`}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {clientsWithLocation.map((client) => (
              <Marker
                key={client.id}
                coordinate={{
                  latitude: client.latitude!,
                  longitude: client.longitude!,
                }}
                title={client.full_name}
                description={client.phone || client.email}
                pinColor="#8b5cf6"
                onPress={() => setSelectedClient(client)}
              >
                <Callout onPress={() => router.push(`/clients/${client.id}`)}>
                  <View style={tw`p-2 min-w-48`}>
                    <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                      {client.full_name}
                    </Text>
                    {client.phone && (
                      <Text style={tw`text-sm text-gray-600`}>{client.phone}</Text>
                    )}
                    {client.email && (
                      <Text style={tw`text-sm text-gray-600`}>{client.email}</Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {selectedClient && (
            <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200`}>
              <Card style={tw`m-4 mb-6`}>
                <View style={tw`flex-row items-start justify-between mb-3`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-lg font-bold text-gray-900`}>
                      {selectedClient.full_name}
                    </Text>
                    {selectedClient.company && (
                      <Text style={tw`text-sm text-gray-600 mt-0.5`}>
                        {selectedClient.company}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => setSelectedClient(null)}>
                    <X size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-row flex-wrap gap-2 mb-3`}>
                  {selectedClient.phone && (
                    <TouchableOpacity
                      onPress={() => handleCall(selectedClient.phone!)}
                      style={tw`flex-row items-center bg-green-50 px-3 py-2 rounded-lg`}
                    >
                      <Phone size={16} color="#16a34a" />
                      <Text style={tw`text-sm font-medium text-green-700 ml-1`}>
                        Зателефонувати
                      </Text>
                    </TouchableOpacity>
                  )}

                  {selectedClient.email && (
                    <TouchableOpacity
                      onPress={() => handleEmail(selectedClient.email!)}
                      style={tw`flex-row items-center bg-blue-50 px-3 py-2 rounded-lg`}
                    >
                      <Mail size={16} color="#0284c7" />
                      <Text style={tw`text-sm font-medium text-blue-700 ml-1`}>
                        Email
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleNavigate(selectedClient)}
                    style={tw`flex-row items-center bg-purple-50 px-3 py-2 rounded-lg`}
                  >
                    <Navigation size={16} color="#8b5cf6" />
                    <Text style={tw`text-sm font-medium text-purple-700 ml-1`}>
                      Навігація
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => router.push(`/clients/${selectedClient.id}`)}
                  style={tw`bg-gray-100 rounded-lg py-2 px-4`}
                >
                  <Text style={tw`text-sm font-medium text-gray-700 text-center`}>
                    Переглянути профіль
                  </Text>
                </TouchableOpacity>
              </Card>
            </View>
          )}

          <View style={tw`absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg`}>
            <Text style={tw`text-xs font-medium text-gray-700`}>
              Клієнтів: {clientsWithLocation.length}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

export default ClientsMapScreen;
