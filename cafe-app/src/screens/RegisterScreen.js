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

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      await setToken(response.data.token);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const message = validationErrors
        ? Object.values(validationErrors).flat().join('\n')
        : err.response?.data?.message || 'Registrasi gagal, coba lagi.';
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
        <Text className="text-sm text-white/70">Buat akun buat mulai nyimpen cafe favorit</Text>
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
          <Text className="text-sm font-semibold text-gray-700 mb-1">Nama</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 mb-4 text-base"
            placeholder="Nama kamu"
            value={name}
            onChangeText={setName}
          />

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
            className="border border-gray-200 rounded-lg px-4 py-3 mb-4 text-base"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text className="text-sm font-semibold text-gray-700 mb-1">Konfirmasi Password</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 mb-2 text-base"
            placeholder="••••••••"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            secureTextEntry
          />

          {error && (
            <Text className="text-sm text-red-600 mb-2">{error}</Text>
          )}

          <TouchableOpacity
            className="bg-[#5B4CCC] rounded-lg py-3 mt-3 items-center"
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Daftar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-sm text-gray-500">
              Udah punya akun? <Text className="text-[#5B4CCC] font-semibold">Masuk</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;