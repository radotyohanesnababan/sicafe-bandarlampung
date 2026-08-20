import React, { useState, useEffect } from 'react';
import api, { getToken } from '../services/api';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Linking,
  Modal,
  Dimensions
} from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

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

  // State untuk Image Preview Modal
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const fetchNotes = async (cafeId) => {
    try {
      const response = await api.get('/cafe-notes');
      const list = response.data.cafe_notes || response.data.data || response.data || [];
      setNotes(list.filter((n) => n.cafe_id === cafeId));
    } catch (err) {}
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
      const newNote = response.data.cafe_note || response.data.data || response.data;
      setNotes((prev) => [newNote, ...prev]);
      setNoteText('');
      setNoteRating(0);
    } catch (err) {} finally {
      setNoteSubmitting(false);
    }
  };

  const checkFavoriteStatus = async (cafeId) => {
    try {
      const response = await api.get('/favorites');
      const match = response.data.favorites.some((fav) => fav.cafe_id === cafeId);
      setIsFavorited(match);
    } catch (err) {}
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
    } catch (err) {} finally {
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
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" bounces={false}>
        {/* Full Bleed Hero Image Carousel */}
        <View className="bg-slate-200">
          {cafe.photos && cafe.photos.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {cafe.photos.map((photo, index) => (
                <TouchableOpacity 
                  key={photo.id || index}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedImage(photo.path);
                    setPreviewVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: photo.path }}
                    style={{ width, height: 320 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={{ width, height: 320 }} className="items-center justify-center bg-amber-100">
              <Text className="text-6xl">☕</Text>
            </View>
          )}

          {/* Gradient Overlay for Text Readability at Bottom of Image */}
          <View className="absolute bottom-0 left-0 right-0 h-32 bg-black/40" />

          {/* Floating Action Button (Love) */}
          <TouchableOpacity
            className={`absolute top-10 right-5 rounded-full p-3 shadow-lg ${isFavorited ? 'bg-red-500' : 'bg-white/80'}`}
            onPress={handleFavoritePress}
            disabled={favoriteLoading}
          >
            <Text className="text-xl">{isFavorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>

          {/* Image Indicators */}
          {cafe.photos && cafe.photos.length > 1 && (
            <View className="absolute bottom-4 right-5 bg-black/50 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-bold">1 / {cafe.photos.length}</Text>
            </View>
          )}
        </View>

        {/* Main Info Section (Overlapping the hero image slightly) */}
        <View className="bg-white rounded-t-3xl -mt-6 pt-6 px-5 pb-5">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-extrabold text-slate-900 flex-1 leading-tight">
              {cafe.name}
            </Text>
          </View>
          
          <View className="flex-row items-center mt-1 mb-4">
            {cafe.category && (
              <View className="bg-amber-100 rounded-full px-3 py-1 mr-3">
                <Text className="text-xs font-bold text-amber-700">
                  {categoryLabels[cafe.category] || cafe.category}
                </Text>
              </View>
            )}
            
            {(cafe.review_count > 0 || cafe.avg_rating > 0) && (
              <View className="flex-row items-center">
                <Text className="text-amber-500 font-bold mr-1">★</Text>
                <Text className="text-sm font-bold text-slate-700 mr-1">
                  {cafe.review_count ? `${(cafe.review_count/1000).toFixed(1)}k` : Number(cafe.avg_rating).toFixed(1)}
                </Text>
                <Text className="text-xs text-slate-400">ulasan</Text>
              </View>
            )}
            
            {cafe.price_level > 0 && (
              <Text className="text-sm font-bold text-emerald-600 ml-3">
                {priceLabels[cafe.price_level] || '$'.repeat(cafe.price_level)}
              </Text>
            )}
          </View>

          {/* Action Button: Google Maps */}
          {cafe.lat && cafe.lng && (
            <TouchableOpacity 
              className="flex-row items-center justify-center bg-[#D97706] rounded-xl py-3.5 mt-2 shadow-sm"
              onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`)}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg mr-2">📍</Text>
              <Text className="text-white font-bold text-base">Buka di Google Maps</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Detail Grid / List */}
        <View className="bg-white mt-2 px-5 py-5">
          <Text className="text-lg font-bold text-slate-800 mb-4">Informasi</Text>
          
          {cafe.address && (
            <View className="flex-row mb-4">
              <View className="w-8 items-center mr-2"><Text className="text-xl">🗺️</Text></View>
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-semibold mb-0.5">Alamat</Text>
                <Text className="text-slate-700 leading-relaxed">{fetchedAddress || cafe.address}</Text>
              </View>
            </View>
          )}

          {cafe.phone && (
            <View className="flex-row mb-4">
              <View className="w-8 items-center mr-2"><Text className="text-xl">📞</Text></View>
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-semibold mb-0.5">Telepon</Text>
                <Text className="text-slate-700">{cafe.phone}</Text>
              </View>
            </View>
          )}

          {cafe.opening_hours && (
            <View className="flex-row mb-4">
              <View className="w-8 items-center mr-2"><Text className="text-xl">🕒</Text></View>
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-semibold mb-0.5">Jam Buka</Text>
                <Text className="text-slate-700">{cafe.opening_hours}</Text>
              </View>
            </View>
          )}

          {cafe.website && (
            <View className="flex-row mb-1">
              <View className="w-8 items-center mr-2"><Text className="text-xl">🌐</Text></View>
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-semibold mb-0.5">Website</Text>
                <TouchableOpacity onPress={() => Linking.openURL(cafe.website)}>
                  <Text className="text-amber-600 font-medium">{cafe.website}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {cafe.description && (
          <View className="bg-white mt-2 px-5 py-5">
            <Text className="text-lg font-bold text-slate-800 mb-2">Tentang Tempat Ini</Text>
            <Text className="text-[15px] text-slate-600 leading-relaxed">{cafe.description}</Text>
          </View>
        )}

        {/* Personal Notes */}
        {getToken() && (
          <View className="bg-white mt-2 px-5 py-6">
            <Text className="text-lg font-bold text-slate-800 mb-4">Catatan Pribadi</Text>

            {/* Rating picker */}
            <View className="flex-row mb-3 items-center">
              <Text className="text-slate-500 mr-3">Beri Nilai:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNoteRating(star)}>
                  <Text className={`text-2xl mr-1 ${star <= noteRating ? 'text-amber-500' : 'text-slate-300'}`}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base mb-3 min-h-[100px]"
              placeholder="Tulis pengalaman atau menu favoritmu di sini..."
              placeholderTextColor="#94a3b8"
              value={noteText}
              onChangeText={setNoteText}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              className="bg-amber-100 rounded-xl py-3.5 items-center border border-amber-200"
              onPress={handleAddNote}
              disabled={noteSubmitting}
            >
              <Text className="text-amber-700 font-bold">
                {noteSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
              </Text>
            </TouchableOpacity>

            {/* Existing notes */}
            {notes.length > 0 && (
              <View className="mt-6 space-y-4">
                {notes.map((n) => (
                  <View key={n.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {n.rating && (
                      <View className="flex-row mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Text key={i} className={`text-sm ${i < n.rating ? 'text-amber-500' : 'text-slate-300'}`}>
                            ★
                          </Text>
                        ))}
                      </View>
                    )}
                    <Text className="text-[15px] text-slate-700 mt-1 leading-relaxed">{n.note}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Bottom spacer */}
        <View className="h-10" />
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-10 right-5 z-10 bg-white/20 p-2 rounded-full"
            onPress={() => setPreviewVisible(false)}
          >
            <Text className="text-white text-xl font-bold">✕</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default CafeDetailScreen;