// src/navigation/BuyerNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import ProduceListScreen from '../screens/buyer/ProduceListScreen';
import ProduceDetailScreen from '../screens/buyer/ProduceDetailScreen';
import MyOrdersScreen from '../screens/buyer/MyOrdersScreen';

const Stack = createStackNavigator();

const BuyerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen name="BuyerHome" component={BuyerHomeScreen} options={{ title: 'Marketplace' }} />
      <Stack.Screen name="ProduceList" component={ProduceListScreen} options={{ title: 'Available Produce' }} />
      <Stack.Screen name="ProduceDetail" component={ProduceDetailScreen} options={{ title: 'Produce Details' }} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
    </Stack.Navigator>
  );
};

export default BuyerNavigator;