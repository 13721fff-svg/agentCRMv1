import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import tw, { useThemedStyles } from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function CreateRequestScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('name');
    if (data) setCategories(data);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !categoryId) {
      Alert.alert('Помилка', 'Заповніть всі обов\'язкові поля');
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('requests')
        .insert([
          {
            client_id: user?.id,
            category_id: categoryId,
            title: title.trim(),
            description: description.trim(),
            budget: budget ? parseFloat(budget) : null,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Успіх', 'Запит створено! Очікуйте пропозицій від виконавців.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Помилка', 'Не вдалося створити запит');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <Header title="Новий запит" showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Card style={tw`mb-4`}>
          <Input
            label="Назва послуги *"
            value={title}
            onChangeText={setTitle}
            placeholder="Наприклад: Ремонт квартири"
          />

          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-gray-900 mb-2`}>Категорія *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={[
                    tw`px-4 py-2 rounded-lg mr-2 border`,
                    categoryId === cat.id
                      ? tw`bg-blue-600 border-blue-600`
                      : tw`bg-white border-gray-300`,
                  ]}
                >
                  <Text
                    style={tw`text-sm font-medium ${
                      categoryId === cat.id ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {cat.name_uk || cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-gray-900 mb-2`}>Опис *</Text>
            <TextInput
              style={tw`bg-white border border-gray-300 rounded-lg p-3 text-gray-900 min-h-32`}
              value={description}
              onChangeText={setDescription}
              placeholder="Детально опишіть що потрібно зробити..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <Input
            label="Бюджет (грн)"
            value={budget}
            onChangeText={setBudget}
            placeholder="Орієнтовна сума"
            keyboardType="numeric"
          />

          <Button
            title="Створити запит"
            onPress={handleSubmit}
            loading={saving}
            fullWidth
          />
        </Card>
      </ScrollView>
    </View>
  );
}
