import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Callout, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Clock, Navigation, X, Calendar, CheckCircle, XCircle } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { useAuthStore } from '@/store/authStore';
import { useMeetingsStore } from '@/store/meetingsStore';
import { supabase } from '@/lib/supabase';
import { Meeting } from '@/types';

function MeetingsMapScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { meetings, setMeetings } = useMeetingsStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  useEffect(() => {
    getCurrentLocation();
    loadMeetings();
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

  const loadMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('org_id', user?.org_id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('start_time', new Date().toISOString())
        .order('start_time');

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  const handleNavigate = async (meeting: Meeting) => {
    if (!meeting.latitude || !meeting.longitude) return;

    const destination = `${meeting.latitude},${meeting.longitude}`;
    const label = encodeURIComponent(meeting.title);

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

  const calculateRoute = () => {
    const meetingsWithLocation = meetings
      .filter((m) => m.latitude && m.longitude && m.status === 'scheduled')
      .sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

    if (location && meetingsWithLocation.length > 0) {
      const coords = [
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        ...meetingsWithLocation.map((m) => ({
          latitude: m.latitude!,
          longitude: m.longitude!,
        })),
      ];
      setRouteCoordinates(coords);
      setShowRoute(true);
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#16a34a';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#0284c7';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} color="#16a34a" />;
      case 'cancelled':
        return <XCircle size={14} color="#ef4444" />;
      default:
        return <Calendar size={14} color="#0284c7" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (Platform.OS === 'web') {
    return (
      <View style={tw`flex-1 bg-white`}>
        <Header title="Зустрічі на карті" showBack />
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <MapPin size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 text-center mt-4`}>
            Карта зустрічей доступна тільки на iOS та Android
          </Text>
        </View>
      </View>
    );
  }

  const meetingsWithLocation = meetings.filter(
    (m) => m.latitude && m.longitude
  );

  const initialRegion = {
    latitude: location?.coords.latitude || 50.4501,
    longitude: location?.coords.longitude || 30.5234,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header
        title="Зустрічі на карті"
        showBack
        rightAction={
          meetingsWithLocation.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                if (showRoute) {
                  setShowRoute(false);
                  setRouteCoordinates([]);
                } else {
                  calculateRoute();
                }
              }}
              style={tw`px-3 py-1 rounded-lg ${showRoute ? 'bg-red-100' : 'bg-blue-100'}`}
            >
              <Text style={tw`text-xs font-medium ${showRoute ? 'text-red-700' : 'text-blue-700'}`}>
                {showRoute ? 'Сховати маршрут' : 'Показати маршрут'}
              </Text>
            </TouchableOpacity>
          )
        }
      />

      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : meetingsWithLocation.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <MapPin size={48} color="#9ca3af" />
          <Text style={tw`text-lg text-gray-600 text-center mt-4`}>
            Немає зустрічей з локацією
          </Text>
          <Text style={tw`text-sm text-gray-500 text-center mt-2`}>
            Додайте локацію до зустрічей, щоб побачити їх на карті
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
            {showRoute && routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#0284c7"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}

            {meetingsWithLocation.map((meeting, index) => (
              <Marker
                key={meeting.id}
                coordinate={{
                  latitude: meeting.latitude!,
                  longitude: meeting.longitude!,
                }}
                title={meeting.title}
                description={`${formatDate(meeting.start_time)} ${formatTime(meeting.start_time)}`}
                pinColor={getMarkerColor(meeting.status)}
                onPress={() => setSelectedMeeting(meeting)}
              >
                <View style={tw`items-center`}>
                  <View
                    style={tw`bg-white rounded-full px-2 py-1 border-2 ${
                      meeting.status === 'completed'
                        ? 'border-green-500'
                        : meeting.status === 'cancelled'
                        ? 'border-red-500'
                        : 'border-blue-500'
                    }`}
                  >
                    <Text style={tw`text-xs font-bold text-gray-900`}>
                      {index + 1}
                    </Text>
                  </View>
                  <View
                    style={tw`w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent ${
                      meeting.status === 'completed'
                        ? 'border-t-green-500'
                        : meeting.status === 'cancelled'
                        ? 'border-t-red-500'
                        : 'border-t-blue-500'
                    }`}
                  />
                </View>

                <Callout onPress={() => router.push(`/meetings/${meeting.id}`)}>
                  <View style={tw`p-2 min-w-48`}>
                    <Text style={tw`text-base font-semibold text-gray-900 mb-1`}>
                      {meeting.title}
                    </Text>
                    <Text style={tw`text-sm text-gray-600`}>
                      {formatDate(meeting.start_time)} {formatTime(meeting.start_time)}
                    </Text>
                    {meeting.location && (
                      <Text style={tw`text-sm text-gray-600 mt-1`}>
                        {meeting.location}
                      </Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {selectedMeeting && (
            <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200`}>
              <Card style={tw`m-4 mb-6`}>
                <View style={tw`flex-row items-start justify-between mb-3`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-lg font-bold text-gray-900`}>
                      {selectedMeeting.title}
                    </Text>
                    <View style={tw`flex-row items-center mt-1`}>
                      <Clock size={14} color="#6b7280" />
                      <Text style={tw`text-sm text-gray-600 ml-1`}>
                        {formatDate(selectedMeeting.start_time)}{' '}
                        {formatTime(selectedMeeting.start_time)}
                      </Text>
                    </View>
                  </View>
                  <View style={tw`flex-row items-center gap-2`}>
                    {getStatusIcon(selectedMeeting.status)}
                    <TouchableOpacity onPress={() => setSelectedMeeting(null)}>
                      <X size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedMeeting.location && (
                  <View style={tw`flex-row items-center mb-3`}>
                    <MapPin size={14} color="#6b7280" />
                    <Text style={tw`text-sm text-gray-600 ml-1`}>
                      {selectedMeeting.location}
                    </Text>
                  </View>
                )}

                <View style={tw`flex-row gap-2`}>
                  <TouchableOpacity
                    onPress={() => handleNavigate(selectedMeeting)}
                    style={tw`flex-1 flex-row items-center justify-center bg-blue-50 px-3 py-2 rounded-lg`}
                  >
                    <Navigation size={16} color="#0284c7" />
                    <Text style={tw`text-sm font-medium text-blue-700 ml-1`}>
                      Навігація
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/meetings/${selectedMeeting.id}`)}
                    style={tw`flex-1 bg-gray-100 rounded-lg py-2 px-4`}
                  >
                    <Text style={tw`text-sm font-medium text-gray-700 text-center`}>
                      Деталі
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          )}

          <View style={tw`absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg`}>
            <Text style={tw`text-xs font-medium text-gray-700`}>
              Зустрічей: {meetingsWithLocation.length}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

export default MeetingsMapScreen;
