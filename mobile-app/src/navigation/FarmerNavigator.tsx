// src/navigation/FarmerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import AddProduceScreen from '../screens/farmer/AddProduceScreen';
import MyListingsScreen from '../screens/farmer/MyListingsScreen';
import IncomingOrdersScreen from '../screens/farmer/IncomingOrdersScreen';
import StorageBrowseScreen from '../screens/farmer/StorageBrowseScreen';
import StorageBookScreen from '../screens/farmer/StorageBookScreen';
import MyStorageBookingsScreen from '../screens/farmer/MyStorageBookingsScreen';
import TransportBrowseScreen from '../screens/farmer/TransportBrowseScreen';
import TransportRequestScreen from '../screens/farmer/TransportRequestScreen';
import MyTransportBookingsScreen from '../screens/farmer/MyTransportBookingsScreen';
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

const farmerHeader = {
  headerStyle: { backgroundColor: '#1E5631' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '800' as const },
  headerShadowVisible: false,
};

const FarmerHomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={farmerHeader}>
      <Stack.Screen name="Home" component={FarmerHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="AddProduce" component={AddProduceScreen} options={{ title: 'Add Produce' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
};

const StorageStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={farmerHeader}>
      <Stack.Screen name="StorageBrowse" component={StorageBrowseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StorageBook" component={StorageBookScreen} options={{ title: 'Book Storage' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
};

const MyStorageStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={farmerHeader}>
      <Stack.Screen name="MyStorageBookings" component={MyStorageBookingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
};

const TransportStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={farmerHeader}>
      <Stack.Screen name="TransportBrowse" component={TransportBrowseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
};

const MyTransportStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={farmerHeader}>
      <Stack.Screen name="MyTransportBookings" component={MyTransportBookingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
};

const FarmerNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 10 },
        tabBarActiveTintColor: '#1E5631',
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
        component={FarmerHomeStack}
        options={{
          title: 'Home',
          tabBarIcon: tabIcon(0x1f3e0),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={StorageStack}
        options={{
          title: 'Storage',
          tabBarIcon: tabIcon(0x1f3ed),
        }}
      />
      <Tab.Screen
        name="StorageBookingsTab"
        component={MyStorageStack}
        options={{
          title: 'My Storage',
          tabBarIcon: tabIcon(0x1f4e6),
        }}
      />
      <Tab.Screen
        name="TransportTab"
        component={TransportStack}
        options={{
          title: 'Transport',
          tabBarIcon: tabIcon(0x1f69a),
        }}
      />
      <Tab.Screen
        name="MyTransportTab"
        component={MyTransportStack}
        options={{
          title: 'My Trips',
          tabBarIcon: tabIcon(0x1f5fa),
        }}
      />
      <Tab.Screen
        name="ListingsTab"
        component={MyListingsScreen}
        options={{
          title: 'Listings',
          ...farmerHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f33e),
          tabBarButton: () => null, // hide from tab bar, keep route register
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={IncomingOrdersScreen}
        options={{
          title: 'Orders',
          ...farmerHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f6d2),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          title: 'Account',
          ...farmerHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f464),
        }}
      />
    </Tab.Navigator>
  );
};

export default FarmerNavigator;
