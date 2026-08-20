import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

const LoadingSpinner = ({ message }) => {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <ActivityIndicator size="large" color="#5B4CCC" />
      {message && <Text className="mt-3 text-sm text-gray-400">{message}</Text>}
    </View>
  );
};

export default LoadingSpinner;