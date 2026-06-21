import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExploreHomeScreen from '../screens/common/ExploreHomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

const PublicNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#111',
        headerTitleStyle: { fontWeight: '900' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Explore" component={ExploreHomeScreen} options={{ title: 'HarvestConnect' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    </Stack.Navigator>
  );
};

export default PublicNavigator;

