import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { getToken, setToken } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsLoggedIn(!!getToken());
    }, [])
  );

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (isLoggedIn) {
        await api.post('/logout');
      }
    } catch (err) {
      console.log('Error logout', err);
    } finally {
      await setToken(null);
      setIsLoggedIn(false);
      setLoading(false);
      // Pindah ke layar login jika perlu, atau tetap di sini
      navigation.navigate('Home');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View className="flex-1 bg-amber-50 justify-center items-center p-8">
      <View className="bg-white p-8 rounded-3xl w-full items-center shadow-sm border border-amber-100">
        <Text className="text-7xl mb-4">👤</Text>
        <Text className="text-2xl font-extrabold text-slate-800 mb-2">Profil Pengguna</Text>
        
        {isLoggedIn ? (
          <>
            <Text className="text-slate-500 text-center mb-8">
              Anda saat ini masuk sebagai pengguna terdaftar. Anda memiliki akses penuh untuk menambah favorit dan menulis catatan.
            </Text>
            
            <TouchableOpacity 
              className="bg-red-50 w-full py-4 rounded-xl border border-red-200 items-center flex-row justify-center"
              onPress={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <Text className="text-red-500 font-bold text-lg">Keluar Akun</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-slate-500 text-center mb-8">
              Masuk untuk menyimpan kafe favorit Anda dan menulis catatan pribadi di setiap kunjungan.
            </Text>
            
            <TouchableOpacity 
              className="bg-[#D97706] w-full py-4 rounded-xl shadow-sm items-center"
              onPress={handleLogin}
            >
              <Text className="text-white font-bold text-lg">Masuk / Daftar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default ProfileScreen;
