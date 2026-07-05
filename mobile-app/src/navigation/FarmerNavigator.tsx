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
import MyTrackingScreen from '../screens/farmer/MyTrackingScreen';
import ReviewSubmitScreen from '../screens/common/ReviewSubmitScreen';
import MyTransactionsScreen from '../screens/common/MyTransactionsScreen';
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
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddProduce" component={AddProduceScreen} options={{ title: 'Add Produce' }} />
      <Stack.Screen name="StorageBrowse" component={StorageBrowseScreen} options={{ title: 'Find Storage', headerShown: false }} />
      <Stack.Screen name="StorageBook" component={StorageBookScreen} options={{ title: 'Book Storage' }} />
      <Stack.Screen name="MyStorageBookings" component={MyStorageBookingsScreen} options={{ title: 'My Storage', headerShown: false }} />
      <Stack.Screen name="TransportBrowse" component={TransportBrowseScreen} options={{ title: 'Find Transport', headerShown: false }} />
      <Stack.Screen name="MyTransportBookings" component={MyTransportBookingsScreen} options={{ title: 'My Trips', headerShown: false }} />
      <Stack.Screen name="MyTracking" component={MyTrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SubmitReview" component={ReviewSubmitScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
};

const ListingsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={farmerHeader}>
      <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddProduce" component={AddProduceScreen} options={{ title: 'Add Produce' }} />
    </Stack.Navigator>
  );
};

const AccountStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={farmerHeader}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyTransactions" component={MyTransactionsScreen} options={{ headerShown: false }} />
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
        name="ListingsTab"
        component={ListingsStack}
        options={{
          title: 'Listings',
          tabBarIcon: tabIcon(0x1f33e),
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
        component={AccountStack}
        options={{
          title: 'Account',
          tabBarIcon: tabIcon(0x1f464),
        }}
      />
    </Tab.Navigator>
  );
};

export default FarmerNavigator;
