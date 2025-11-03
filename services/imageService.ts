import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

interface UploadResult {
  url: string;
  path: string;
}

class ImageService {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Потрібен дозвіл на доступ до галереї');
      return false;
    }
    return true;
  }

  async pickImage(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return null;

      return result.assets[0].uri;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати зображення');
      return null;
    }
  }

  async takePhoto(): Promise<string | null> {
    if (Platform.OS === 'web') {
      Alert.alert('Інформація', 'Камера доступна тільки на мобільних пристроях');
      return null;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Потрібен дозвіл на доступ до камери');
      return null;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return null;

      return result.assets[0].uri;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Помилка', 'Не вдалося зробити фото');
      return null;
    }
  }

  async uploadImage(
    uri: string,
    bucket: string,
    folder: string,
    fileName?: string
  ): Promise<UploadResult | null> {
    try {
      const fileExt = uri.split('.').pop() || 'jpg';
      const finalFileName = fileName || `${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${finalFileName}`;

      let fileData: Blob | File;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileData = await response.blob();
      } else {
        const response = await fetch(uri);
        const blob = await response.blob();
        fileData = blob;
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileData, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити зображення');
      return null;
    }
  }

  async deleteImage(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  async uploadAvatar(uri: string, userId: string): Promise<string | null> {
    const result = await this.uploadImage(uri, 'avatars', 'users', `${userId}.jpg`);
    return result?.url || null;
  }

  async uploadClientPhoto(uri: string, clientId: string): Promise<string | null> {
    const result = await this.uploadImage(uri, 'photos', 'clients', `${clientId}_${Date.now()}.jpg`);
    return result?.url || null;
  }

  async uploadOrderPhoto(uri: string, orderId: string): Promise<string | null> {
    const result = await this.uploadImage(uri, 'photos', 'orders', `${orderId}_${Date.now()}.jpg`);
    return result?.url || null;
  }

  async uploadReviewPhoto(uri: string, reviewId: string): Promise<string | null> {
    const result = await this.uploadImage(uri, 'photos', 'reviews', `${reviewId}_${Date.now()}.jpg`);
    return result?.url || null;
  }

  getImageUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

export const imageService = new ImageService();
