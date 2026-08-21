import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  RefreshControl,
  Image
} from 'react-native';
import api from '../services/api';
import CafeCard from '../components/CafeCard';

const { width } = Dimensions.get('window');

// Komponen Card Kecil untuk Kategori
const CategoryIcon = ({ icon, label, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-white rounded-2xl p-4 items-center justify-center border border-slate-100 shadow-sm"
    style={{ width: (width - 60) / 4 }}
  >
    <Text className="text-2xl mb-1">{icon}</Text>
    <Text className="text-xs font-bold text-slate-700 text-center">{label}</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [popularCafes, setPopularCafes] = useState([]);
  const [budgetCafes, setBudgetCafes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDiscoverData = async () => {
    try {
      const [popRes, budgetRes] = await Promise.all([
        api.get('/cities/bandar-lampung/cafes?sort_by=popular'),
        api.get('/cities/bandar-lampung/cafes?price_level=1&sort_by=rating')
      ]);
      setPopularCafes(popRes.data.cafes.data.slice(0, 10) || []);
      setBudgetCafes(budgetRes.data.cafes.data.slice(0, 10) || []);
    } catch (err) {
      console.log('Error fetching discover data', err);
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoverData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDiscoverData();
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== '') {
      navigation.navigate('CafeList', { appliedFilters: { keyword: searchQuery } });
    }
  };

  const handleCategoryPress = (categoryId) => {
    navigation.navigate('CafeList', { appliedFilters: { category: categoryId } });
  };

  const renderCarousel = (title, data, onViewAll, isLoading) => {
    if (isLoading) {
      return (
        <View className="mt-6">
          <View className="px-5 mb-3 flex-row justify-between items-end">
            <Text className="text-xl font-extrabold text-slate-800">{title}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {[1, 2].map((idx) => (
              <View key={idx} style={{ width: width * 0.75, marginRight: 15 }} className="bg-white rounded-3xl mb-4 overflow-hidden shadow-sm border border-slate-100 p-4">
                <View className="w-full h-32 bg-slate-200 rounded-2xl mb-4 animate-pulse" />
                <View className="h-6 w-3/4 bg-slate-200 rounded animate-pulse mb-2" />
                <View className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }
    if (!data || data.length === 0) return null;
    return (
      <View className="mt-6">
        <View className="px-5 mb-3 flex-row justify-between items-end">
          <Text className="text-xl font-extrabold text-slate-800">{title}</Text>
          {onViewAll && (
            <TouchableOpacity onPress={onViewAll}>
              <Text className="text-amber-600 font-bold">Lihat Semua</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          snapToInterval={width * 0.75 + 15}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {data.map((item, index) => (
            <View key={`car-${item.slug}-${index}`} style={{ width: width * 0.75, marginRight: 15 }}>
              <CafeCard cafe={item} onPress={() => navigation.navigate('CafeDetail', { cafeSlug: item.slug })} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D97706" />}
      >
        {/* Header and Search Box */}
        <View className="bg-amber-600 px-5 pt-14 pb-8 rounded-b-3xl shadow-sm">
          <Text className="text-3xl font-extrabold text-white mb-1">Hai, Penjelajah!</Text>
          <Text className="text-amber-100 text-base mb-6">Mau nongkrong di mana hari ini?</Text>

          {/* Search Box */}
          <TouchableOpacity 
            className="flex-row items-center bg-white p-2 rounded-2xl shadow-lg border border-amber-500"
            activeOpacity={0.9}
            onPress={() => navigation.navigate('CafeList', { appliedFilters: {} })} // Arahkan ke CafeList dengan filter kosong
          >
            <Text className="pl-3 pr-2 text-xl">🔍</Text>
            <TextInput
              className="flex-1 text-slate-700 font-semibold text-base py-3"
              placeholder="Cari tempat nongkrong..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity 
              className="bg-amber-100 rounded-xl p-3"
              onPress={() => navigation.navigate('Filter', { currentFilters: {} })}
            >
              <Text className="text-amber-700 text-lg">🎚️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Category Grid */}
        <View className="px-5 mt-6 flex-row justify-between">
          <CategoryIcon icon="☕" label="Kafe" onPress={() => handleCategoryPress('cafe')} />
          <CategoryIcon icon="🍵" label="Coffee Shop" onPress={() => handleCategoryPress('coffee_shop')} />
          <CategoryIcon icon="💻" label="Coworking" onPress={() => handleCategoryPress('coworking')} />
          <CategoryIcon icon="🍽️" label="Restoran" onPress={() => handleCategoryPress('restoran')} />
        </View>

        {/* Carousels */}
        {renderCarousel(
          "Rekomendasi Populer", 
          popularCafes, 
          () => navigation.navigate('CafeList', { appliedFilters: { sort_by: 'popular' } }),
          initialLoading
        )}
        
        {renderCarousel(
          "Pilihan Hemat di Kantong", 
          budgetCafes, 
          () => navigation.navigate('CafeList', { appliedFilters: { price_level: 1, sort_by: 'rating' } }),
          initialLoading
        )}

        <TouchableOpacity 
          className="mx-5 mt-8 mb-4 bg-amber-100 py-4 rounded-xl items-center border border-amber-200"
          onPress={() => navigation.navigate('CafeList', { appliedFilters: {} })}
        >
          <Text className="font-bold text-amber-700 text-lg">Jelajahi Semua Tempat 🌍</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
};

export default HomeScreen;