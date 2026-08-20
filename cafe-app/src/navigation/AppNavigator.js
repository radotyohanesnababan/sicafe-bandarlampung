import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from '../navigation/MainTabNavigator';
import CafeListScreen from '../screens/CafeListScreen';
import CafeDetailScreen from '../screens/CafeDetailScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import FilterScreen from '../screens/FilterScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#D97706',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CafeList"
        component={CafeListScreen}
        options={({ route }) => ({ title: route.params?.cityName || 'Daftar Cafe' })}
      />
      <Stack.Screen
        name="CafeDetail"
        component={CafeDetailScreen}
        options={{ title: 'Detail Cafe' }}
      />
      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{ title: 'Filter Pencarian', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;