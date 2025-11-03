import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Search, Check, X } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Button from '@/components/Button';

function MapPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    returnTo?: string;
    initialLat?: string;
    initialLng?: string;
  }>();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (params.initialLat && params.initialLng) {
      setSelectedLocation({
        latitude: parseFloat(params.initialLat),
        longitude: parseFloat(params.initialLng),
      });
    }
  }, [params.initialLat, params.initialLng]);

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
      setLoading(false);
    } catch (err) {
      console.error('Error getting location:', err);
      setLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = geocode
        ? [
            geocode.streetNumber,
            geocode.street,
            geocode.city,
            geocode.region,
            geocode.country,
          ]
            .filter(Boolean)
            .join(', ')
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setSelectedLocation({ latitude, longitude, address });
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      setSelectedLocation({
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const results = await Location.geocodeAsync(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: any) => {
    const address = [
      result.streetNumber,
      result.street,
      result.city,
      result.region,
      result.country,
    ]
      .filter(Boolean)
      .join(', ');

    setSelectedLocation({
      latitude: result.latitude,
      longitude: result.longitude,
      address,
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    if (!selectedLocation) return;

    const returnPath = params.returnTo || '/meetings/create';
    router.push({
      pathname: returnPath as any,
      params: {
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
        address: selectedLocation.address || '',
      },
    });
  };

  if (Platform.OS === 'web') {
    return (
      <View style={tw`flex-1 bg-white`}>
        <Header title="Вибрати локацію" showBack />
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <MapPin size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 text-center mt-4`}>
            Вибір локації на карті доступний тільки на iOS та Android
          </Text>
          <Text style={tw`text-sm text-gray-500 text-center mt-2`}>
            Використовуйте мобільний застосунок для цієї функції
          </Text>
        </View>
      </View>
    );
  }

  const initialRegion = {
    latitude: selectedLocation?.latitude || location?.coords.latitude || 50.4501,
    longitude: selectedLocation?.longitude || location?.coords.longitude || 30.5234,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header title="Вибрати локацію" showBack />

      <View style={tw`px-4 py-3 border-b border-gray-200`}>
        <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3 py-2`}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={tw`flex-1 ml-2 text-base text-gray-900`}
            placeholder="Пошук адреси..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color="#0284c7" />}
        </View>

        {selectedLocation?.address && (
          <View style={tw`mt-2 flex-row items-center bg-blue-50 rounded-lg p-3`}>
            <MapPin size={16} color="#0284c7" />
            <Text style={tw`flex-1 ml-2 text-sm text-gray-900`} numberOfLines={2}>
              {selectedLocation.address}
            </Text>
            <TouchableOpacity onPress={() => setSelectedLocation(null)}>
              <X size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {searchResults.length > 0 && (
        <ScrollView style={tw`max-h-48 border-b border-gray-200 bg-white`}>
          {searchResults.map((result, index) => {
            const address = [
              result.streetNumber,
              result.street,
              result.city,
              result.region,
              result.country,
            ]
              .filter(Boolean)
              .join(', ');

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectSearchResult(result)}
                style={tw`px-4 py-3 border-b border-gray-100`}
              >
                <View style={tw`flex-row items-center`}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={tw`flex-1 ml-2 text-base text-gray-900`}>{address}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <View style={tw`flex-1`}>
          <MapView
            style={tw`flex-1`}
            initialRegion={initialRegion}
            region={
              selectedLocation
                ? {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : undefined
            }
            showsUserLocation
            showsMyLocationButton
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title="Обрана локація"
                pinColor="#0284c7"
              />
            )}
          </MapView>

          <View style={tw`absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200`}>
            <Button
              title="Підтвердити локацію"
              onPress={handleConfirm}
              disabled={!selectedLocation}
              fullWidth
            />
            <Text style={tw`text-xs text-gray-500 text-center mt-2`}>
              Натисніть на карту щоб вибрати локацію
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default MapPickerScreen;
