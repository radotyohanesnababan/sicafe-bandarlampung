import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar
} from 'react-native';
import api, { setToken } from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Focus states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

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
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
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
      className="flex-1 bg-amber-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      
      <ScrollView className="flex-1" bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Top Header Background */}
        <View className="h-64 w-full bg-[#D97706] rounded-b-[40px] items-center justify-center pt-10">
          <View className="bg-white/20 p-5 rounded-full mb-4">
            <Text className="text-5xl">🍩</Text>
          </View>
          <Text className="text-2xl font-extrabold text-white mb-2 tracking-wide">Bergabunglah!</Text>
          <Text className="text-sm text-amber-100 font-medium px-10 text-center">
            Buat akun untuk menyimpan dan me-review cafe favoritmu.
          </Text>
        </View>

        {/* Interactive Form (Bottom Sheet Style) */}
        <View className="flex-1 px-6 -mt-10 mb-8">
          <View className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <Text className="text-2xl font-bold text-slate-800 mb-1">Daftar Akun Baru</Text>
            <Text className="text-sm text-slate-500 mb-6">Lengkapi data diri Anda di bawah ini</Text>

            {/* Name Input */}
            <Text className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Nama Lengkap</Text>
            <View className={`border-2 rounded-xl px-4 h-14 justify-center mb-4 ${isNameFocused ? 'border-[#D97706] bg-amber-50/30' : 'border-slate-200 bg-slate-50'}`}>
              <TextInput
                className="text-base text-slate-800"
                placeholder="Nama kamu"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>

            {/* Email Input */}
            <Text className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Email</Text>
            <View className={`border-2 rounded-xl px-4 h-14 justify-center mb-4 ${isEmailFocused ? 'border-[#D97706] bg-amber-50/30' : 'border-slate-200 bg-slate-50'}`}>
              <TextInput
                className="text-base text-slate-800"
                placeholder="kamu@example.com"
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
            <View className={`border-2 rounded-xl px-4 h-14 justify-center mb-4 ${isPasswordFocused ? 'border-[#D97706] bg-amber-50/30' : 'border-slate-200 bg-slate-50'}`}>
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

            {/* Confirm Password Input */}
            <Text className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Konfirmasi Password</Text>
            <View className={`border-2 rounded-xl px-4 h-14 justify-center mb-2 ${isConfirmFocused ? 'border-[#D97706] bg-amber-50/30' : 'border-slate-200 bg-slate-50'}`}>
              <TextInput
                className="text-base text-slate-800"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry
                onFocus={() => setIsConfirmFocused(true)}
                onBlur={() => setIsConfirmFocused(false)}
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
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white font-extrabold text-lg">Daftar Akun</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500 font-medium">Udah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.6}>
                <Text className="text-[#D97706] font-bold">Masuk di Sini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;