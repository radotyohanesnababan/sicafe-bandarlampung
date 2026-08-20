import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import api, { setToken } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/login', { email, password });
      await setToken(response.data.token);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      const message = err.response?.data?.message || 'Email atau password salah.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="bg-[#5B4CCC] px-5 pt-16 pb-10">
        <Text className="text-4xl mb-1">☕</Text>
        <Text className="text-[26px] font-extrabold text-white mb-1">SiCafe</Text>
        <Text className="text-sm text-white/70">Masuk buat lanjutin nyari cafe</Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-6 -mt-4">
        <View
          className="bg-white rounded-xl p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text className="text-sm font-semibold text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 mb-4 text-base"
            placeholder="kamu@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text className="text-sm font-semibold text-gray-700 mb-1">Password</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 mb-2 text-base"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error && (
            <Text className="text-sm text-red-600 mb-2">{error}</Text>
          )}

          <TouchableOpacity
            className="bg-[#5B4CCC] rounded-lg py-3 mt-3 items-center"
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Masuk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => navigation.navigate('Register')}
          >
            <Text className="text-sm text-gray-500">
              Belum punya akun? <Text className="text-[#5B4CCC] font-semibold">Daftar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;