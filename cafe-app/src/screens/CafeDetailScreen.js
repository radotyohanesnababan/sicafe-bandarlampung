import React, { useState, useEffect } from 'react';
import api, { getToken } from '../services/api';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Linking } from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';


const CafeDetailScreen = ({ route, navigation }) => {
  const { cafeSlug } = route.params;

  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [noteRating, setNoteRating] = useState(0);
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const [fetchedAddress, setFetchedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    const fetchCafe = async () => {
      try {
        setError(null);
        const response = await api.get(`/cafes/${cafeSlug}`);
        setCafe(response.data);
        if (getToken()) {
          checkFavoriteStatus(response.data.id);
          fetchNotes(response.data.id);
        }
      } catch (err) {
        setError('Gagal memuat detail cafe.');
      } finally {
        setLoading(false);
      }
    };
    fetchCafe();
  }, [cafeSlug]);

  const fetchLocationAddress = async () => {
    if (!cafe || !cafe.lat || !cafe.lng) return;
    try {
      setAddressLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${cafe.lat}&lon=${cafe.lng}`,
        {
          headers: {
            'User-Agent': 'SiCafeApp/1.0',
            'Accept-Language': 'id'
          }
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        setFetchedAddress(data.display_name);
      }
    } catch (err) {
      console.log('Reverse geocoding error:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (cafe && cafe.lat && cafe.lng && !fetchedAddress) {
      fetchLocationAddress();
    }
  }, [cafe?.lat, cafe?.lng]);

  const fetchNotes = async (cafeId) => {
    try {
      const response = await api.get('/cafe-notes');
      console.log('Notes response:', JSON.stringify(response.data, null, 2));
      const list = response.data.cafe_notes || response.data.data || response.data || [];
      setNotes(list.filter((n) => n.cafe_id === cafeId));
    } catch (err) {
      // gagal load notes, biarin kosong
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      setNoteSubmitting(true);
      const response = await api.post('/cafe-notes', {
        cafe_id: cafe.id,
        note: noteText.trim(),
        rating: noteRating || null,
      });
      console.log('Add note response:', JSON.stringify(response.data, null, 2));
      const newNote = response.data.cafe_note || response.data.data || response.data;
      setNotes((prev) => [newNote, ...prev]);
      setNoteText('');
      setNoteRating(0);
    } catch (err) {
      console.log('Add note error:', JSON.stringify(err.response?.data, null, 2));
    } finally {
      setNoteSubmitting(false);
    }
  };

  const checkFavoriteStatus = async (cafeId) => {
    try {
      const response = await api.get('/favorites');
      const match = response.data.favorites.some((fav) => fav.cafe_id === cafeId);
      setIsFavorited(match);
    } catch (err) {
      // gagal cek status, biarin default (belum favorite)
    }
  };

  const handleFavoritePress = async () => {
    if (!getToken()) {
      navigation.navigate('Login');
      return;
    }
    if (favoriteLoading) return;

    try {
      setFavoriteLoading(true);
      const response = await api.post('/favorites', { cafe_id: cafe.id });
      setIsFavorited(response.data.favorited);
    } catch (err) {
      console.log('Favorite error:', JSON.stringify(err.response?.data, null, 2));
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Memuat detail cafe..." />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-base text-red-600 text-center">{error}</Text>
      </View>
    );
  }

  if (!cafe) return null;

  const priceLabels = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
  const categoryLabels = {
    cafe: 'Cafe',
    coffee_shop: 'Coffee Shop',
    coworking: 'Coworking',
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-200">
        <Text className="text-[22px] font-extrabold text-gray-900 flex-1">{cafe.name}</Text>
        <View className="flex-row items-center">
          {cafe.avg_rating != null && (
            <View className="bg-yellow-400 rounded-lg px-3 py-1.5 mr-2">
              <Text className="text-base font-bold text-gray-900">★ {Number(cafe.avg_rating).toFixed(1)}</Text>
            </View>
          )}
          <TouchableOpacity
            className={isFavorited ? 'bg-red-500 rounded-full p-2.5' : 'bg-gray-200 rounded-full p-2.5'}
            onPress={handleFavoritePress}
            disabled={favoriteLoading}
          >
            <Text className="text-lg">{isFavorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* City */}
      {cafe.city && (
        <View className="bg-white mt-3 p-5">
          <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Kota</Text>
          <Text className="text-base text-gray-700">{cafe.city.name}</Text>
        </View>
      )}

      {/* Address */}
      {cafe.address && (
        <View className="bg-white mt-3 p-5">
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Alamat</Text>
            {addressLoading && (
              <Text className="text-xs text-blue-600 font-semibold">Mencari...</Text>
            )}
          </View>
          <Text className="text-base text-gray-700">{fetchedAddress || cafe.address}</Text>
        </View>
      )}

      {/* Category & Price */}
      <View className="flex-row bg-white mt-3">
        {cafe.category && (
          <View className="flex-1 p-5 border-r border-gray-100">
            <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Kategori</Text>
            <Text className="text-base text-gray-700">{categoryLabels[cafe.category] || cafe.category}</Text>
          </View>
        )}
        {cafe.price_level && (
          <View className="flex-1 p-5">
            <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Harga</Text>
            <Text className="text-base text-gray-700">{priceLabels[cafe.price_level] || cafe.price_level}</Text>
          </View>
        )}
      </View>

      {/* Google Maps Button */}
      {cafe.lat && cafe.lng && (
        <View className="bg-white px-5 pb-5">
          <TouchableOpacity 
            className="flex-row items-center justify-center bg-blue-50 border border-blue-200 rounded-lg py-3"
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`)}
          >
            <Text className="text-xl mr-2">🗺️</Text>
            <Text className="text-blue-700 font-bold">Buka di Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Phone */}
      {cafe.phone && (
        <View className="bg-white mt-3 p-5">
          <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Telepon</Text>
          <Text className="text-base text-gray-700">{cafe.phone}</Text>
        </View>
      )}

      {/* Opening Hours */}
      {cafe.opening_hours && (
        <View className="bg-white mt-3 p-5">
          <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Jam Buka</Text>
          <Text className="text-base text-gray-700">{cafe.opening_hours}</Text>
        </View>
      )}

      {/* Website */}
      {cafe.website && (
        <View className="bg-white mt-3 p-5">
          <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Website</Text>
          <Text className="text-base text-blue-600">{cafe.website}</Text>
        </View>
      )}

      {/* Description */}
      {cafe.description && (
        <View className="bg-white mt-3 p-5">
          <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Deskripsi</Text>
          <Text className="text-[15px] text-gray-600 leading-[22px]">{cafe.description}</Text>
        </View>
      )}

      {/* Photos */}
      <View className="bg-white mt-3 p-5">
        <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Foto</Text>
        {cafe.photos && cafe.photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cafe.photos.map((photo) => (
              <Image
                key={photo.id}
                source={{ uri: photo.path }}
                className="w-48 h-36 rounded-lg mr-3"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View className="w-full h-36 bg-gray-50 rounded-lg items-center justify-center border border-gray-200 border-dashed">
            <Text className="text-3xl mb-2">📸</Text>
            <Text className="text-gray-400 text-sm">Belum ada foto</Text>
          </View>
        )}
      </View>

      {/* Personal Notes */}
      {getToken() && (
        <View className="bg-white mt-3 p-5">
          <Text className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Catatan Saya</Text>

          {/* Rating picker */}
          <View className="flex-row mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setNoteRating(star)}>
                <Text className="text-2xl mr-1">{star <= noteRating ? '★' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 text-base mb-3"
            placeholder="Tulis catatan tentang cafe ini..."
            value={noteText}
            onChangeText={setNoteText}
            multiline
          />

          <TouchableOpacity
            className="bg-[#5B4CCC] rounded-lg py-3 items-center"
            onPress={handleAddNote}
            disabled={noteSubmitting}
          >
            <Text className="text-white font-bold">
              {noteSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
            </Text>
          </TouchableOpacity>

          {/* Existing notes */}
          {notes.map((n) => (
            <View key={n.id} className="mt-4 pt-4 border-t border-gray-100">
              {n.rating && <Text className="text-yellow-500 mb-1">{'★'.repeat(n.rating)}</Text>}
              <Text className="text-[15px] text-gray-700">{n.note}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Bottom spacer */}
      <View className="h-8" />
    </ScrollView>
  );
};

export default CafeDetailScreen;