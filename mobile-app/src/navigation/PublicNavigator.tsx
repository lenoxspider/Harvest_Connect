import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/public/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PublicProduceListScreen from '../screens/public/PublicProduceListScreen';
import PublicProduceDetailScreen from '../screens/public/PublicProduceDetailScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import { navStyles } from './navStyles';

const Stack = createStackNavigator();

const PublicNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...navStyles.header,
      }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProduceListPublic" component={PublicProduceListScreen} options={{ title: 'Produce' }} />
      <Stack.Screen name="PublicProduceDetail" component={PublicProduceDetailScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    </Stack.Navigator>
  );
};

export default PublicNavigator;

