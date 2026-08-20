import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const KECAMATAN_LIST = [
  'Tanjung Karang', 'Way Halim', 'Kedaton', 
  'Rajabasa', 'Teluk Betung', 'Kemiling', 
  'Sukarame', 'Langkapura', 'Bumi Waras'
];

const CATEGORIES = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'coffee_shop', label: 'Coffee Shop' },
  { id: 'coworking', label: 'Coworking Space' },
  { id: 'restoran', label: 'Restoran' },
];

const FilterScreen = ({ navigation, route }) => {
  // Terima filter yang sedang aktif dari HomeScreen (jika ada)
  const currentFilters = route.params?.currentFilters || {};
  
  const [category, setCategory] = useState(currentFilters.category || 'all');
  const [kecamatan, setKecamatan] = useState(currentFilters.kecamatan || '');
  const [priceLevel, setPriceLevel] = useState(currentFilters.price_level || '');
  const [sortBy, setSortBy] = useState(currentFilters.sort_by || 'popular');

  const handleApply = () => {
    // Kirim filter yang dipilih ke CafeListScreen
    navigation.navigate('CafeList', {
      appliedFilters: {
        category,
        kecamatan,
        price_level: priceLevel,
        sort_by: sortBy
      }
    });
  };

  const handleReset = () => {
    setCategory('all');
    setKecamatan('');
    setPriceLevel('');
    setSortBy('popular');
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5 pt-6 pb-20">
        
        {/* Sort By */}
        <Text className="text-lg font-bold text-slate-800 mb-3">Urutkan Berdasarkan</Text>
        <View className="flex-row mb-8 bg-slate-200 rounded-lg p-1">
          <TouchableOpacity 
            className={`flex-1 py-2 items-center rounded-md ${sortBy === 'popular' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setSortBy('popular')}
          >
            <Text className={`font-bold ${sortBy === 'popular' ? 'text-amber-600' : 'text-slate-500'}`}>Paling Populer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2 items-center rounded-md ${sortBy === 'rating' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setSortBy('rating')}
          >
            <Text className={`font-bold ${sortBy === 'rating' ? 'text-amber-600' : 'text-slate-500'}`}>Rating Tertinggi</Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        <Text className="text-lg font-bold text-slate-800 mb-3">Kategori</Text>
        <View className="flex-row flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategory(cat.id)}
              className={`mr-2 mb-3 px-4 py-2 rounded-full border ${category === cat.id ? 'bg-amber-100 border-amber-500' : 'bg-white border-slate-300'}`}
            >
              <Text className={`font-bold ${category === cat.id ? 'text-amber-700' : 'text-slate-600'}`}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location / Kecamatan */}
        <Text className="text-lg font-bold text-slate-800 mb-3">Lokasi (Kecamatan)</Text>
        <View className="flex-row flex-wrap mb-6">
          <TouchableOpacity
              onPress={() => setKecamatan('')}
              className={`mr-2 mb-3 px-4 py-2 rounded-full border ${kecamatan === '' ? 'bg-amber-100 border-amber-500' : 'bg-white border-slate-300'}`}
            >
            <Text className={`font-bold ${kecamatan === '' ? 'text-amber-700' : 'text-slate-600'}`}>Semua Lokasi</Text>
          </TouchableOpacity>
          
          {KECAMATAN_LIST.map(kec => (
            <TouchableOpacity
              key={kec}
              onPress={() => setKecamatan(kec)}
              className={`mr-2 mb-3 px-4 py-2 rounded-full border ${kecamatan === kec ? 'bg-amber-100 border-amber-500' : 'bg-white border-slate-300'}`}
            >
              <Text className={`font-bold ${kecamatan === kec ? 'text-amber-700' : 'text-slate-600'}`}>{kec}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Level */}
        <Text className="text-lg font-bold text-slate-800 mb-3">Tingkat Harga</Text>
        <View className="flex-row mb-10">
          {[1, 2, 3, 4].map(price => (
            <TouchableOpacity
              key={price}
              onPress={() => setPriceLevel(priceLevel === price ? '' : price)}
              className={`flex-1 mr-2 py-3 items-center rounded-xl border ${priceLevel === price ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-300'}`}
            >
              <Text className={`font-bold text-lg ${priceLevel === price ? 'text-emerald-700' : 'text-slate-400'}`}>
                {'$'.repeat(price)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Footer Buttons */}
      <View className="flex-row p-5 bg-white border-t border-slate-200">
        <TouchableOpacity 
          className="py-4 px-6 rounded-xl border border-slate-300 mr-3"
          onPress={handleReset}
        >
          <Text className="font-bold text-slate-600">Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 bg-[#D97706] py-4 rounded-xl items-center shadow-sm"
          onPress={handleApply}
        >
          <Text className="font-extrabold text-white text-lg">Terapkan Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FilterScreen;
