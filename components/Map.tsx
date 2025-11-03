import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, MapType } from 'react-native-maps';
import * as Location from 'expo-location';
import { Layers } from 'lucide-react-native';
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
    color?: string;
  }>;
  onLocationSelect?: (location: { latitude: number; longitude: number; address?: string }) => void;
  showCurrentLocation?: boolean;
  showMapTypeSelector?: boolean;
  height?: number;
}

export default function Map({
  latitude,
  longitude,
  markers = [],
  onLocationSelect,
  showCurrentLocation = true,
  showMapTypeSelector = false,
  height = 300,
}: MapComponentProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');

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

  const toggleMapType = () => {
    setMapType((prev) => {
      if (prev === 'standard') return 'satellite';
      if (prev === 'satellite') return 'hybrid';
      return 'standard';
    });
  };

  const getMapTypeLabel = () => {
    switch (mapType) {
      case 'satellite':
        return 'Супутник';
      case 'hybrid':
        return 'Гібрид';
      default:
        return 'Карта';
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        mapType={mapType}
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
            pinColor={marker.color || '#ef4444'}
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

      {showMapTypeSelector && (
        <TouchableOpacity
          onPress={toggleMapType}
          style={styles.mapTypeButton}
        >
          <Layers size={16} color="#0284c7" />
          <Text style={tw`text-xs font-medium text-blue-700 ml-1`}>
            {getMapTypeLabel()}
          </Text>
        </TouchableOpacity>
      )}
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
  mapTypeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
