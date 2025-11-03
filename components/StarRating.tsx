import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import tw from '@/lib/tw';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  editable?: boolean;
  onChange?: (rating: number) => void;
  showNumber?: boolean;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 20,
  editable = false,
  onChange,
  showNumber = false,
}: StarRatingProps) {
  const handlePress = (index: number) => {
    if (editable && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <View style={tw`flex-row items-center`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const filled = index < Math.floor(rating);
        const partial = index < rating && index >= Math.floor(rating);

        if (editable) {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(index)}
              style={tw`mr-1`}
              activeOpacity={0.7}
            >
              <Star
                size={size}
                color={filled || partial ? '#f59e0b' : '#d1d5db'}
                fill={filled || partial ? '#f59e0b' : 'transparent'}
              />
            </TouchableOpacity>
          );
        }

        return (
          <View key={index} style={tw`mr-1`}>
            <Star
              size={size}
              color={filled || partial ? '#f59e0b' : '#d1d5db'}
              fill={filled || partial ? '#f59e0b' : 'transparent'}
            />
          </View>
        );
      })}
      {showNumber && (
        <Text style={tw`text-sm font-medium text-gray-700 ml-2`}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
