// src/navigation/StorageNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import StorageOwnerHomeScreen from '../screens/storage/StorageOwnerHomeScreen';
import AddStorageScreen from '../screens/storage/AddStorageScreen';
import MyFacilitiesScreen from '../screens/storage/MyFacilitiesScreen';
import StorageBookingsScreen from '../screens/storage/StorageBookingsScreen';
import SearchScreen from '../screens/buyer/SearchScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import TrackingScreen from '../screens/common/TrackingScreen';
import { navStyles } from './navStyles';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon =
  (codePoint: number) =>
  ({ focused }: { focused: boolean }) => (
    <Text style={{ opacity: focused ? 1 : 0.7 }}>
      {String.fromCodePoint(codePoint)}
    </Text>
  );

const storageHeader = {
  headerStyle: { backgroundColor: '#1565C0' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '800' as const },
  headerShadowVisible: false,
};

const StorageHomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={storageHeader}>
      <Stack.Screen name="Home" component={StorageOwnerHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddStorage" component={AddStorageScreen} options={{ title: 'Add Storage Facility' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Tracking' }} />
    </Stack.Navigator>
  );
};

const StorageNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 10 },
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: '#7F8C8D',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={StorageHomeStack}
        options={{
          title: 'Home',
          tabBarIcon: tabIcon(0x1f3e0),
        }}
      />
      <Tab.Screen
        name="FacilitiesTab"
        component={MyFacilitiesScreen}
        options={{
          title: 'Facilities',
          headerShown: false,
          tabBarIcon: tabIcon(0x1f3ed),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={StorageBookingsScreen}
        options={{
          title: 'Bookings',
          ...storageHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f4cb),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          title: 'Account',
          headerShown: false,
          tabBarIcon: tabIcon(0x1f464),
        }}
      />
    </Tab.Navigator>
  );
};

export default StorageNavigator;
