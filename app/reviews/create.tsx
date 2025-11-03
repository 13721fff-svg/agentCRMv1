import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StarRating from '@/components/StarRating';
import { useAuthStore } from '@/store/authStore';
import { useReviewsStore } from '@/store/reviewsStore';
import { supabase } from '@/lib/supabase';

export default function CreateReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ providerId?: string; orderId?: string; clientName?: string }>();
  const { user } = useAuthStore();
  const { addReview } = useReviewsStore();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user || !params.providerId) return;

    if (!comment.trim()) {
      Alert.alert('Помилка', 'Будь ласка, напишіть відгук');
      return;
    }

    try {
      setSaving(true);

      const reviewData = {
        reviewer_id: user.id,
        provider_id: params.providerId,
        order_id: params.orderId || null,
        rating,
        comment: comment.trim(),
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      addReview(data);

      Alert.alert('Успіх', 'Дякуємо за ваш відгук!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating review:', error);
      Alert.alert('Помилка', 'Не вдалося створити відгук');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title="Новий відгук" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-900 mb-2`}>
            Відгук для {params.clientName || 'виконавця'}
          </Text>
          {params.orderId && (
            <Text style={tw`text-sm text-gray-600 mb-4`}>
              За замовлення #{params.orderId.slice(0, 8)}
            </Text>
          )}

          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-gray-900 mb-2`}>Оцінка</Text>
            <StarRating rating={rating} editable onChange={setRating} size={32} />
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-gray-900 mb-2`}>Коментар</Text>
            <TextInput
              style={tw`bg-white border border-gray-300 rounded-lg p-3 text-gray-900 min-h-32`}
              value={comment}
              onChangeText={setComment}
              placeholder="Поділіться вашим досвідом..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={tw`flex-row gap-3`}>
            <Button
              title="Скасувати"
              onPress={() => router.back()}
              variant="outline"
              style={tw`flex-1`}
            />
            <Button
              title="Опублікувати"
              onPress={handleSubmit}
              loading={saving}
              style={tw`flex-1`}
            />
          </View>
        </Card>

        <Card>
          <Text style={tw`text-sm font-medium text-gray-900 mb-2`}>Поради для відгуку</Text>
          <View style={tw`space-y-2`}>
            <Text style={tw`text-sm text-gray-600`}>• Будьте конкретними та чесними</Text>
            <Text style={tw`text-sm text-gray-600`}>
              • Опишіть якість роботи та обслуговування
            </Text>
            <Text style={tw`text-sm text-gray-600`}>
              • Вкажіть, що сподобалось і що можна покращити
            </Text>
            <Text style={tw`text-sm text-gray-600`}>• Будьте ввічливими та коректними</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
