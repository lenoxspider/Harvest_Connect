// src/navigation/StorageNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import StorageOwnerHomeScreen from '../screens/storage/StorageOwnerHomeScreen';
import AddStorageScreen from '../screens/storage/AddStorageScreen';
import MyFacilitiesScreen from '../screens/storage/MyFacilitiesScreen';
import StorageBookingsScreen from '../screens/storage/StorageBookingsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import { navStyles } from './navStyles';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const StorageTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        ...navStyles.tabBar,
        ...navStyles.header,
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={StorageOwnerHomeScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>🏡</Text> }}
      />
      <Tab.Screen
        name="My Facilities"
        component={MyFacilitiesScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>🏬</Text> }}
      />
      <Tab.Screen
        name="Bookings"
        component={StorageBookingsScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>📅</Text> }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
};

const StorageNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={navStyles.header}>
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
