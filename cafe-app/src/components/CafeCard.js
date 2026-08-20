import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const categoryLabels = {
  cafe: 'Cafe',
  coffee_shop: 'Coffee Shop',
  coworking: 'Coworking',
};

const CafeCard = ({ cafe, onPress }) => {
  // Ambil gambar pertama jika ada, jika tidak kosong
  const imageUrl = cafe.photos && cafe.photos.length > 0 ? cafe.photos[0].path : null;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-5 my-3 overflow-hidden"
      style={styles.shadow}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Hero Image Section */}
      <View className="h-48 w-full bg-slate-200">
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-indigo-100">
            <Text className="text-4xl">☕</Text>
          </View>
        )}
        
        {/* Category Badge on top of image */}
        {cafe.category && (
          <View className="absolute top-3 left-3 bg-black/60 rounded-full px-3 py-1 flex-row items-center">
            <Text className="text-xs font-medium text-white">
              {categoryLabels[cafe.category] || cafe.category}
            </Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-xl font-extrabold text-slate-800 flex-1 leading-tight" numberOfLines={2}>
            {cafe.name}
          </Text>
          
          {/* Review Count / Popularity */}
          {(cafe.review_count > 0 || cafe.avg_rating > 0) && (
            <View className="bg-amber-100 rounded-lg px-2 py-1 ml-3 flex-row items-center border border-amber-200">
              <Text className="text-xs font-bold text-amber-600 mr-1">★</Text>
              <Text className="text-xs font-bold text-amber-700">
                {cafe.review_count ? `${(cafe.review_count/1000).toFixed(1)}k` : Number(cafe.avg_rating).toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {cafe.address && (
          <Text className="text-sm text-slate-500 mb-3" numberOfLines={2}>
            {cafe.address}
          </Text>
        )}

        {/* Footer / Extra info */}
        <View className="flex-row items-center">
          {cafe.review_count > 0 && (
            <Text className="text-xs font-medium text-slate-400">
              {cafe.review_count} Ulasan Google
            </Text>
          )}
          {cafe.price_level > 0 && (
            <>
              <Text className="text-slate-300 mx-2">•</Text>
              <Text className="text-xs font-medium text-emerald-600">
                {'$'.repeat(cafe.price_level)}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});

export default CafeCard;