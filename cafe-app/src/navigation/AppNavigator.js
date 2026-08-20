import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CafeListScreen from '../screens/CafeListScreen';
import CafeDetailScreen from '../screens/CafeDetailScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#5B4CCC',
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
        name="Home"
        component={HomeScreen}
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
    </Stack.Navigator>
  );
};

export default AppNavigator;