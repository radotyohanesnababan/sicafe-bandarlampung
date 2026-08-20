import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { getToken } from '../services/api';
import CafeCard from '../components/CafeCard';

const SavedScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'notes'
  
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [favRes, noteRes] = await Promise.all([
        api.get('/favorites'),
        api.get('/cafe-notes')
      ]);
      setFavorites(favRes.data.favorites || []);
      setNotes(noteRes.data.notes || noteRes.data.data || []);
    } catch (err) {
      console.log('Error fetching saved data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const token = getToken();
      if (token) {
        setIsLoggedIn(true);
        fetchData();
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderFavoriteItem = ({ item }) => (
    <CafeCard 
      cafe={item.cafe} 
      onPress={() => navigation.navigate('CafeDetail', { cafeSlug: item.cafe.slug })} 
    />
  );

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-2xl mx-5 my-3 p-5 shadow-sm border border-slate-100"
      onPress={() => navigation.navigate('CafeDetail', { cafeSlug: item.cafe.slug })}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-slate-800 flex-1">{item.cafe.name}</Text>
        {item.rating && (
          <View className="flex-row">
            {[...Array(5)].map((_, i) => (
              <Text key={i} className={`text-sm ${i < item.rating ? 'text-amber-500' : 'text-slate-200'}`}>
                ★
              </Text>
            ))}
          </View>
        )}
      </View>
      <Text className="text-slate-600 leading-relaxed">{item.note}</Text>
      <Text className="text-xs text-slate-400 mt-3 text-right">
        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-amber-50">
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View className="flex-1 bg-amber-50 justify-center items-center p-8">
        <View className="bg-white p-8 rounded-3xl w-full items-center shadow-sm border border-amber-100">
          <Text className="text-6xl mb-4">🔐</Text>
          <Text className="text-xl font-bold text-slate-800 text-center mb-2">Login Diperlukan</Text>
          <Text className="text-slate-500 text-center mb-6">
            Silakan login untuk menyimpan kafe favorit Anda atau melihat catatan pribadi.
          </Text>
          <TouchableOpacity 
            className="bg-[#D97706] w-full py-4 rounded-xl shadow-sm items-center"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white font-bold text-lg">Ke Halaman Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-amber-50">
      {/* Tabs */}
      <View className="flex-row bg-[#D97706] px-4 pt-4 pb-2 rounded-b-2xl shadow-sm">
        <TouchableOpacity 
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'favorites' ? 'border-white' : 'border-transparent'}`}
          onPress={() => setActiveTab('favorites')}
        >
          <Text className={`font-bold ${activeTab === 'favorites' ? 'text-white' : 'text-amber-200'}`}>
            Cafe Favorit ({favorites.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'notes' ? 'border-white' : 'border-transparent'}`}
          onPress={() => setActiveTab('notes')}
        >
          <Text className={`font-bold ${activeTab === 'notes' ? 'text-white' : 'text-amber-200'}`}>
            Catatan Saya ({notes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'favorites' ? (
        favorites.length > 0 ? (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFavoriteItem}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D97706" />}
          />
        ) : (
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-6xl mb-4">🤍</Text>
            <Text className="text-lg font-bold text-slate-700 text-center mb-2">Belum ada favorit</Text>
            <Text className="text-slate-500 text-center">Tekan icon hati di detail cafe untuk menyimpannya ke sini.</Text>
          </View>
        )
      ) : (
        notes.length > 0 ? (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNoteItem}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D97706" />}
          />
        ) : (
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-6xl mb-4">📝</Text>
            <Text className="text-lg font-bold text-slate-700 text-center mb-2">Belum ada catatan</Text>
            <Text className="text-slate-500 text-center">Tulis pengalamanmu di detail cafe agar tidak lupa.</Text>
          </View>
        )
      )}
    </View>
  );
};

export default SavedScreen;
