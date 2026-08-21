import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const categoryLabels = {
  cafe: 'Cafe',
  coffee_shop: 'Coffee Shop',
  coworking: 'Coworking',
};

// Helper for amenity icons
const getAmenityIcon = (amenity) => {
  const lower = amenity.toLowerCase();
  if (lower.includes('wi-fi')) return '📶';
  if (lower.includes('parkir')) return '🅿️';
  if (lower.includes('toilet')) return '🚻';
  if (lower.includes('makan')) return '🍽️';
  if (lower.includes('bawa pulang')) return '🛍️';
  if (lower.includes('pesan antar')) return '🛵';
  return '✨';
};

const CafeCard = ({ cafe, onPress }) => {
  const imageUrl = cafe.photos && cafe.photos.length > 0 ? cafe.photos[0].path : null;
  
  // Safely parse amenities if it's a string, or use directly if array
  let parsedAmenities = [];
  try {
    if (typeof cafe.amenities === 'string') {
      parsedAmenities = JSON.parse(cafe.amenities) || [];
    } else if (Array.isArray(cafe.amenities)) {
      parsedAmenities = cafe.amenities;
    }
  } catch(e) {}
  
  const topAmenities = parsedAmenities.slice(0, 3);

  return (
    <TouchableOpacity
      className="bg-white rounded-3xl mb-4 overflow-hidden"
      style={styles.shadow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Hero Image Section */}
      <View className="h-48 w-full bg-slate-100">
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-amber-50">
            <Text className="text-4xl opacity-50">☕</Text>
          </View>
        )}
        
        {/* Category Badge on top of image */}
        {cafe.category && (
          <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-md rounded-full px-3 py-1 flex-row items-center shadow-sm">
            <Text className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              {categoryLabels[cafe.category] || cafe.category}
            </Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View className="p-4 pt-3">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-[19px] font-extrabold text-slate-800 flex-1 leading-tight" numberOfLines={2}>
            {cafe.name}
          </Text>
          
        {/* Review Count / Popularity */}
        {(cafe.review_count > 0 || cafe.avg_rating > 0) && (
          <View className="bg-amber-50 rounded-lg px-2 py-1 ml-3 flex-row items-center border border-amber-100">
            <Text className="text-xs font-bold text-amber-500 mr-1">★</Text>
            <Text className="text-xs font-bold text-amber-700">
              {Number(cafe.avg_rating).toFixed(1)}
            </Text>
            {cafe.review_count > 0 && (
              <Text className="text-[10px] text-amber-600 ml-1">
                ({cafe.review_count >= 1000 ? `${(cafe.review_count/1000).toFixed(1)}k` : cafe.review_count})
              </Text>
            )}
          </View>
        )}
        </View>

        {cafe.address && (
          <Text className="text-[13px] text-slate-500 mb-2.5 leading-snug" numberOfLines={2}>
            {cafe.address}
          </Text>
        )}

        {/* Info Grid (Opening Hours & Phone) */}
        <View className="flex-row items-center mb-3">
          {cafe.opening_hours && (
            <View className="flex-row items-center mr-4">
              <Text className="text-xs mr-1 text-slate-400">🕒</Text>
              <Text className="text-[12px] font-medium text-emerald-600" numberOfLines={1}>
                {cafe.opening_hours.split(';')[0]} {/* Show just the first day/status */}
              </Text>
            </View>
          )}
          {cafe.phone && (
            <View className="flex-row items-center">
              <Text className="text-xs mr-1 text-slate-400">📞</Text>
              <Text className="text-[12px] font-medium text-slate-600" numberOfLines={1}>
                Tersedia
              </Text>
            </View>
          )}
        </View>

        {/* Footer: Amenities & Price */}
        <View className="flex-row items-center justify-between border-t border-slate-100 pt-3 mt-1">
          <View className="flex-row items-center flex-1">
            {topAmenities.length > 0 ? (
              <View className="flex-row">
                {topAmenities.map((amenity, idx) => (
                  <View key={idx} className="bg-slate-50 rounded-full px-2 py-1 mr-2 border border-slate-200">
                    <Text className="text-[10px] text-slate-600 font-medium">
                      {getAmenityIcon(amenity)} {amenity}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[11px] text-slate-400">Info fasilitas belum tersedia</Text>
            )}
          </View>
          
          {cafe.price_level > 0 && (
            <Text className="text-[13px] font-bold text-emerald-500 tracking-widest ml-2">
              {'$'.repeat(cafe.price_level)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
});

export default CafeCard;