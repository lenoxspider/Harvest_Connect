// src/navigation/StorageNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import StorageOwnerHomeScreen from '../screens/storage/StorageOwnerHomeScreen';
import AddStorageScreen from '../screens/storage/AddStorageScreen';
import MyFacilitiesScreen from '../screens/storage/MyFacilitiesScreen';
import StorageBookingsScreen from '../screens/storage/StorageBookingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const StorageTabs: React.FC = () => {
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
      <Tab.Screen name="Home" component={StorageOwnerHomeScreen} />
      <Tab.Screen name="My Facilities" component={MyFacilitiesScreen} />
      <Tab.Screen name="Bookings" component={StorageBookingsScreen} />
    </Tab.Navigator>
  );
};

const StorageNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="StorageDashboard" 
        component={StorageTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddStorage" 
        component={AddStorageScreen} 
        options={{ title: 'Add Storage Facility' }}
      />
    </Stack.Navigator>
  );
};

export default StorageNavigator;