// src/navigation/FarmerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import AddProduceScreen from '../screens/farmer/AddProduceScreen';
import MyListingsScreen from '../screens/farmer/MyListingsScreen';
import IncomingOrdersScreen from '../screens/farmer/IncomingOrdersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const FarmerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Tab.Screen name="Home" component={FarmerHomeScreen} />
      <Tab.Screen name="My Listings" component={MyListingsScreen} />
      <Tab.Screen name="Orders" component={IncomingOrdersScreen} />
    </Tab.Navigator>
  );
};

const FarmerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="FarmerDashboard" 
        component={FarmerTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddProduce" 
        component={AddProduceScreen} 
        options={{ title: 'Add New Produce' }}
      />
    </Stack.Navigator>
  );
};

export default FarmerNavigator;