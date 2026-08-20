import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
  StatusBar
} from 'react-native';
import api, { setToken } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Focus states
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      const message = err.response?.data?.message || 'Email atau password salah.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-amber-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Top Header Background */}
      <View className="h-2/5 w-full bg-[#D97706] rounded-b-[40px] items-center justify-center pt-10">
        <View className="bg-white/20 p-5 rounded-full mb-4">
          <Text className="text-6xl">☕</Text>
        </View>
        <Text className="text-3xl font-extrabold text-white mb-2 tracking-wide">SiCafe</Text>
        <Text className="text-base text-amber-100 font-medium px-10 text-center">
          Tempat terbaik untuk menemukan kopi favoritmu di Bandar Lampung.
        </Text>
      </View>

      {/* Interactive Form (Bottom Sheet Style) */}
      <View className="flex-1 px-6 -mt-10">
        <View className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
          <Text className="text-2xl font-bold text-slate-800 mb-1">Selamat Datang!</Text>
          <Text className="text-sm text-slate-500 mb-6">Silakan masuk untuk melanjutkan</Text>

          {/* Email Input */}
          <Text className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Email</Text>
          <View className={`border-2 rounded-xl px-4 h-14 justify-center mb-5 ${isEmailFocused ? 'border-[#D97706] bg-amber-50/30' : 'border-slate-200 bg-slate-50'}`}>
            <TextInput
              className="text-base text-slate-800"
              placeholder="Masukkan email Anda"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
            />
          </View>

          {/* Password Input */}
          <Text className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Password</Text>
          <View className={`border-2 rounded-xl px-4 h-14 justify-center mb-2 ${isPasswordFocused ? 'border-[#D97706] bg-amber-50/30' : 'border-slate-200 bg-slate-50'}`}>
            <TextInput
              className="text-base text-slate-800"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 rounded-lg p-3 mb-4 border border-red-100 mt-2">
              <Text className="text-sm text-red-600 text-center font-medium">{error}</Text>
            </View>
          ) : <View className="h-4" />}

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 mt-2 items-center shadow-lg ${loading ? 'bg-amber-400' : 'bg-[#D97706] shadow-amber-600/30'}`}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-extrabold text-lg">Masuk</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500 font-medium">Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.6}>
              <Text className="text-[#D97706] font-bold">Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;