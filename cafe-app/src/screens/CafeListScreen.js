import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CafeCard from '../components/CafeCard';

const CafeListScreen = ({ navigation, route }) => {
  const initialFilters = route.params?.appliedFilters || {};

  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState(initialFilters.keyword || '');
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  // Update filters if they change from FilterScreen
  const filtersString = JSON.stringify(route.params?.appliedFilters || {});
  useEffect(() => {
    if (route.params?.appliedFilters) {
      setAppliedFilters(route.params.appliedFilters);
      setSearchQuery(route.params.appliedFilters.keyword || '');
    }
  }, [filtersString]);

  const fetchCafes = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (pageNumber === 1) setError(null);
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNumber);
      
      if (appliedFilters.keyword) queryParams.append('keyword', appliedFilters.keyword);
      if (appliedFilters.category && appliedFilters.category !== 'all') queryParams.append('category', appliedFilters.category);
      if (appliedFilters.kecamatan) queryParams.append('kecamatan', appliedFilters.kecamatan);
      if (appliedFilters.price_level) queryParams.append('price_level', appliedFilters.price_level);
      if (appliedFilters.sort_by) queryParams.append('sort_by', appliedFilters.sort_by);
      
      const response = await api.get(`/cities/bandar-lampung/cafes?${queryParams.toString()}`);
      
      const newCafes = response.data.cafes.data || [];
      const lastPage = response.data.cafes.last_page || 1;

      if (isRefresh || pageNumber === 1) {
        setCafes(newCafes);
      } else {
        setCafes((prev) => [...prev, ...newCafes]);
      }
      
      setHasMore(pageNumber < lastPage);
      setPage(pageNumber);
      
    } catch (err) {
      if (pageNumber === 1) setError('Gagal memuat data. Coba lagi nanti.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCafes(1, true);
  }, [appliedFilters]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCafes(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      fetchCafes(page + 1, false);
    }
  };

  const handleSearchSubmit = () => {
    setAppliedFilters(prev => ({ ...prev, keyword: searchQuery }));
  };

  const handleCafePress = (cafe) => {
    navigation.navigate('CafeDetail', { cafeSlug: cafe.slug });
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Search Header */}
      <View className="bg-amber-600 px-5 pt-12 pb-4 rounded-b-2xl shadow-sm z-10">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Text className="text-white text-2xl font-bold">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white flex-1">
            {appliedFilters.category ? `Kategori: ${appliedFilters.category}` : 'Pencarian'}
          </Text>
        </View>

        <View className="flex-row items-center bg-white/20 p-1.5 rounded-2xl border border-white/30">
          <Text className="pl-3 pr-2 text-white">🔍</Text>
          <TextInput
            className="flex-1 text-white font-semibold text-base py-2"
            placeholder="Ketik sesuatu..."
            placeholderTextColor="#fde68a"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity 
            className="bg-amber-400 rounded-xl px-4 h-9 flex justify-center mr-1"
            onPress={handleSearchSubmit}
          >
            <Text className="text-amber-900 font-bold">Cari</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-white/20 rounded-xl px-3 h-9 flex justify-center mr-1 ml-1 border border-white/30"
            onPress={() => navigation.navigate('Filter', { currentFilters: appliedFilters })}
          >
            <Text className="text-white text-lg">🎚️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && page === 1 ? (
        <LoadingSpinner message="Mencari cafe terbaik..." />
      ) : error && page === 1 ? (
        <View className="flex-1 justify-center items-center p-8">
          <Text className="text-base text-red-600 text-center">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={cafes}
          keyExtractor={(item, index) => `${item.slug}-${index}`}
          renderItem={({ item }) => (
            <View className="px-5">
              <CafeCard cafe={item} onPress={() => handleCafePress(item)} />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D97706" />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="large" color="#D97706" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-12 mt-10">
              <Text className="text-5xl mb-4">🤷‍♂️</Text>
              <Text className="text-lg text-slate-400 text-center font-medium">
                Hmm, tidak ada tempat yang cocok dengan pencarianmu.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default CafeListScreen;