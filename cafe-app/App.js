import "./global.css";   // ⬅️ Harus di paling atas
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export const loadToken = async () => {
  authToken = await SecureStore.getItemAsync('auth_token');
  return authToken;
};
export default function App() {

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}