import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const categoryLabels = {
  cafe: 'Cafe',
  coffee_shop: 'Coffee Shop',
  coworking: 'Coworking',
};

const CafeCard = ({ cafe, onPress }) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mx-4 my-2"
      style={styles.shadow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-900 flex-1">{cafe.name}</Text>
        {cafe.avg_rating != null && (
          <View className="bg-yellow-400 rounded-lg px-2.5 py-1 ml-2">
            <Text className="text-sm font-semibold text-gray-900">
              ★ {Number(cafe.avg_rating).toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      {cafe.address && (
        <Text className="text-sm text-gray-500 mb-1.5">{cafe.address}</Text>
      )}
      <View className="flex-row items-center">
        {cafe.category && (
          <View className="bg-gray-100 rounded-md px-2 py-0.5 mr-2">
            <Text className="text-xs text-gray-500">
              {categoryLabels[cafe.category] || cafe.category}
            </Text>
          </View>
        )}
        {cafe.price_level && (
          <View className="bg-gray-100 rounded-md px-2 py-0.5">
            <Text className="text-xs text-gray-500">
              {'$'.repeat(cafe.price_level)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default CafeCard;