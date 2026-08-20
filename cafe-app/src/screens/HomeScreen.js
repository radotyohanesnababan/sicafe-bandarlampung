import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { getToken, setToken } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HomeScreen = ({ navigation }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCities = async () => {
    try {
      setError(null);
      const response = await api.get('/cities');
      setCities(response.data.cities);
    } catch (err) {
      setError('Gagal memuat data kota. Coba lagi nanti.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  // Re-check token tiap kali screen ini balik ke fokus
  // (misal setelah login/logout dari screen lain)
  useFocusEffect(
    useCallback(() => {
      setIsLoggedIn(!!getToken());
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCities();
  };

  const handleCityPress = (city) => {
    navigation.navigate('CafeList', { citySlug: city.slug, cityName: city.name });
  };

  const handleAuthButtonPress = async () => {
    if (isLoggedIn) {
      try {
        await api.post('/logout');
      } catch (err) {
        // token mungkin udah expired di server, tetap lanjut clear lokal
      } finally {
        await setToken(null);
        setIsLoggedIn(false);
      }
    } else {
      navigation.navigate('Login');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Memuat daftar kota..." />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-base text-red-600 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-[#5B4CCC] px-5 pt-12 pb-6 flex-row justify-between items-center">
        <View className="flex-1 pr-3">
          <Text className="text-4xl mb-1">☕</Text>
          <Text className="text-[26px] font-extrabold text-white mb-1">SiCafe</Text>
          <Text className="text-sm text-white/70">Temukan cafe favoritmu di kota-kota Indonesia</Text>
        </View>
        <TouchableOpacity
          className={isLoggedIn ? 'bg-red-500 rounded-full py-3 px-6' : 'bg-sky-500 rounded-full py-3 px-6'}
          onPress={handleAuthButtonPress}
        >
          <Text className="text-white font-bold text-center">
            {isLoggedIn ? 'Logout' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* City List */}
      <FlatList
        data={cities}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-xl p-4 mx-4 my-2 flex-row justify-between items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
            onPress={() => handleCityPress(item)}
            activeOpacity={0.7}
          >
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
            </View>
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-sm text-gray-400 text-center">Tidak ada kota ditemukan.</Text>
          </View>
        }
      />
    </View>
  );
};

export default HomeScreen;