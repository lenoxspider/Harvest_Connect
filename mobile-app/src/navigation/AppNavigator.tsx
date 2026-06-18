// src/navigation/AppNavigator.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import FarmerNavigator from './FarmerNavigator';
import BuyerNavigator from './BuyerNavigator';
import TransporterNavigator from './TransporterNavigator';
import StorageNavigator from './StorageNavigator';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const getRoleNavigator = () => {
    if (!user) return AuthNavigator;

    switch (user.role) {
      case 'FARMER':
        return FarmerNavigator;
      case 'BUYER':
        return BuyerNavigator;
      case 'TRANSPORTER':
        return TransporterNavigator;
      case 'STORAGE_OWNER':
        return StorageNavigator;
      default:
        return AuthNavigator;
    }
  };

  const RoleNavigator = getRoleNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={RoleNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;