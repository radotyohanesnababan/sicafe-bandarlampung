import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Text,
} from 'react-native';
import api from '../services/api';
import CafeCard from '../components/CafeCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const CafeListScreen = ({ route, navigation }) => {
  const { citySlug, cityName } = route.params;

  const [cafes, setCafes] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const fetchCafes = async () => {
    try {
      setError(null);
      const response = await api.get(`/cities/${citySlug}/cafes`);
      const cafeData = response.data.cafes.map((item) => ({
        slug: item.slug,
        name: item.name,
        address: item.address,
        avg_rating: item.avg_rating,
        category: item.category,
        price_level: item.price_level,
      }));
      setCafes(cafeData);
      setFilteredCafes(cafeData);
    } catch (err) {
      setError('Gagal memuat data cafe. Coba lagi nanti.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCafes(cafes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = cafes.filter(
        (cafe) =>
          cafe.name.toLowerCase().includes(query) ||
          (cafe.address && cafe.address.toLowerCase().includes(query))
      );
      setFilteredCafes(filtered);
    }
  }, [searchQuery, cafes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCafes();
  };

  const handleCardPress = (cafe) => {
    navigation.navigate('CafeDetail', { cafeSlug: cafe.slug });
  };

  if (loading) {
    return <LoadingSpinner message="Memuat daftar cafe..." />;
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
      <SearchBar
        placeholder="Cari nama cafe atau alamat..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredCafes}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <CafeCard cafe={item} onPress={() => handleCardPress(item)} />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-sm text-gray-400 text-center">Tidak ada cafe ditemukan.</Text>
          </View>
        }
      />
    </View>
  );
};

export default CafeListScreen;