// src/navigation/AppNavigator.tsx
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import PublicNavigator from './PublicNavigator';
import FarmerNavigator from './FarmerNavigator';
import BuyerNavigator from './BuyerNavigator';
import TransporterNavigator from './TransporterNavigator';
import StorageNavigator from './StorageNavigator';
import { GlassBackground } from '../ui/GlassBackground';
import { colors } from '../theme/colors';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <GlassBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ marginTop: 12, color: colors.muted, fontWeight: '700' }}>Loading...</Text>
        </View>
      </GlassBackground>
    );
  }

  const getRoleNavigator = () => {
    if (!user) return PublicNavigator;

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
