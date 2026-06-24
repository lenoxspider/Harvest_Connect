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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon =
  (codePoint: number) =>
  ({ focused }: { focused: boolean }) => (
    <Text style={{ opacity: focused ? 1 : 0.7 }}>
      {String.fromCodePoint(codePoint)}
    </Text>
  );

const StorageHomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={navStyles.header}>
      <Stack.Screen name="Home" component={StorageOwnerHomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="AddStorage" component={AddStorageScreen} options={{ title: 'Add Storage Facility' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Tracking' }} />
    </Stack.Navigator>
  );
};

const StorageNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        ...navStyles.tabBar,
        headerShown: false,
        tabBarLabelStyle: { fontWeight: '700' },
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
        name="SearchTab"
        component={SearchScreen}
        options={{
          title: 'Search',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f50d),
        }}
      />
      <Tab.Screen
        name="FacilitiesTab"
        component={MyFacilitiesScreen}
        options={{
          title: 'Facilities',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f3ec),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={StorageBookingsScreen}
        options={{
          title: 'Bookings',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f4e6),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          title: 'Account',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f464),
        }}
      />
    </Tab.Navigator>
  );
};

export default StorageNavigator;
