// src/navigation/TransporterNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import AddTruckScreen from '../screens/transporter/AddTruckScreen';
import MyListingsScreen from '../screens/transporter/MyListingsScreen';
import IncomingBookingsScreen from '../screens/transporter/IncomingBookingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TransporterTabs: React.FC = () => {
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
      <Tab.Screen name="Home" component={TransporterHomeScreen} />
      <Tab.Screen name="My Trucks" component={MyListingsScreen} />
      <Tab.Screen name="Bookings" component={IncomingBookingsScreen} />
    </Tab.Navigator>
  );
};

const TransporterNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="TransporterDashboard" 
        component={TransporterTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddTruck" 
        component={AddTruckScreen} 
        options={{ title: 'Add Truck' }}
      />
    </Stack.Navigator>
  );
};

export default TransporterNavigator;