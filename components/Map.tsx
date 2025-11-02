import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from '@/lib/tw';

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
  }>;
  onLocationSelect?: (location: { latitude: number; longitude: number; address?: string }) => void;
  showCurrentLocation?: boolean;
  height?: number;
}

export default function Map({
  latitude,
  longitude,
  markers = [],
  onLocationSelect,
  showCurrentLocation = true,
  height = 300,
}: MapComponentProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Доступ до локації заборонено');
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
      setError('Не вдалося отримати локацію');
      setLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    if (!onLocationSelect) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = geocode
        ? `${geocode.street || ''} ${geocode.streetNumber || ''}, ${geocode.city || ''}, ${geocode.country || ''}`.trim()
        : undefined;

      onLocationSelect({ latitude, longitude, address });
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      onLocationSelect({ latitude, longitude });
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, { height }]}>
        <Text style={tw`text-gray-600 text-center`}>
          Карти доступні тільки на iOS та Android
        </Text>
        {(latitude && longitude) && (
          <Text style={tw`text-gray-500 text-sm mt-2`}>
            📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { height }, tw`justify-center items-center`]}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { height }, tw`justify-center items-center p-4`]}>
        <Text style={tw`text-error-600 text-center`}>{error}</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: latitude || location?.coords.latitude || 50.4501,
    longitude: longitude || location?.coords.longitude || 30.5234,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={showCurrentLocation}
        showsMyLocationButton={showCurrentLocation}
        onPress={handleMapPress}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
          />
        ))}

        {latitude && longitude && (
          <Marker
            coordinate={{ latitude, longitude }}
            title="Обрана локація"
            pinColor="#0284c7"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
