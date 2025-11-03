import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MessageCircle, ThumbsUp, Star } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import StarRating from '@/components/StarRating';
import { useAuthStore } from '@/store/authStore';
import { useReviewsStore, Review } from '@/store/reviewsStore';
import { supabase } from '@/lib/supabase';

export default function ReviewsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ providerId?: string }>();
  const { user } = useAuthStore();
  const { reviews, setReviews } = useReviewsStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    loadReviews();
  }, [params.providerId]);

  const loadReviews = async () => {
    if (!params.providerId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(id, full_name, avatar_url)
        `)
        .eq('provider_id', params.providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);

      if (data && data.length > 0) {
        const total = data.length;
        const sum = data.reduce((acc, review) => acc + review.rating, 0);
        const average = sum / total;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach((review) => {
          distribution[review.rating as keyof typeof distribution]++;
        });

        setStats({ average, total, distribution });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити відгуки');
    } finally {
      setLoading(false);
    }
  };

  const renderStarBar = (star: number, count: number) => {
    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

    return (
      <View key={star} style={tw`flex-row items-center mb-2`}>
        <Text style={tw`text-sm text-gray-700 w-6`}>{star}</Text>
        <Star size={16} color="#f59e0b" fill="#f59e0b" style={tw`mx-1`} />
        <View style={tw`flex-1 h-2 bg-gray-200 rounded-full mx-2`}>
          <View
            style={[tw`h-2 bg-amber-400 rounded-full`, { width: `${percentage}%` }]}
          />
        </View>
        <Text style={tw`text-sm text-gray-600 w-8 text-right`}>{count}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <Header title="Відгуки" showBack />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Відгуки" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        {stats.total > 0 && (
          <Card style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`items-center mr-6`}>
                <Text style={tw`text-5xl font-bold text-gray-900`}>
                  {stats.average.toFixed(1)}
                </Text>
                <StarRating rating={stats.average} size={20} />
                <Text style={tw`text-sm text-gray-600 mt-1`}>
                  {stats.total} {stats.total === 1 ? 'відгук' : 'відгуків'}
                </Text>
              </View>

              <View style={tw`flex-1`}>
                {[5, 4, 3, 2, 1].map((star) =>
                  renderStarBar(star, stats.distribution[star as keyof typeof stats.distribution])
                )}
              </View>
            </View>
          </Card>
        )}

        {reviews.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={48} color="#9ca3af" />}
            title="Ще немає відгуків"
            description="Станьте першим, хто залишить відгук"
          />
        ) : (
          reviews.map((review) => (
            <Card key={review.id} style={tw`mb-4`}>
              <View style={tw`flex-row items-start mb-3`}>
                <View
                  style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
                >
                  <Text style={tw`text-blue-700 font-semibold`}>
                    {review.reviewer?.full_name?.[0] || 'U'}
                  </Text>
                </View>

                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-semibold text-gray-900`}>
                    {review.reviewer?.full_name || 'Користувач'}
                  </Text>
                  <StarRating rating={review.rating} size={16} />
                  <Text style={tw`text-xs text-gray-500 mt-1`}>
                    {new Date(review.created_at).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              <Text style={tw`text-gray-700 mb-3`}>{review.comment}</Text>

              {review.reply && (
                <View style={tw`bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500`}>
                  <Text style={tw`text-sm font-semibold text-gray-900 mb-1`}>
                    Відповідь виконавця
                  </Text>
                  <Text style={tw`text-sm text-gray-700`}>{review.reply}</Text>
                  {review.replied_at && (
                    <Text style={tw`text-xs text-gray-500 mt-1`}>
                      {new Date(review.replied_at).toLocaleDateString('uk-UA')}
                    </Text>
                  )}
                </View>
              )}

              <View style={tw`flex-row items-center mt-3 pt-3 border-t border-gray-200`}>
                <TouchableOpacity style={tw`flex-row items-center`}>
                  <ThumbsUp size={16} color="#6b7280" />
                  <Text style={tw`text-sm text-gray-600 ml-1`}>
                    Корисно ({review.helpful_count})
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

