import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExploreHomeScreen from '../screens/common/ExploreHomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { navStyles } from './navStyles';

const Stack = createStackNavigator();

const PublicNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...navStyles.header,
      }}
    >
      <Stack.Screen name="Explore" component={ExploreHomeScreen} options={{ title: 'HarvestConnect' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    </Stack.Navigator>
  );
};

export default PublicNavigator;
