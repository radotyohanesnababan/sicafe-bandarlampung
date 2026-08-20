import React from 'react';
import { View, Text, TextInput } from 'react-native';

const SearchBar = ({ placeholder, value, onChangeText }) => {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-[10px] px-3.5 mx-4 my-2.5 h-11">
      <Text className="text-base mr-2">🔍</Text>
      <TextInput
        className="flex-1 text-[15px] text-gray-800"
        placeholder={placeholder || 'Search cafes...'}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
      />
    </View>
  );
};

export default SearchBar;