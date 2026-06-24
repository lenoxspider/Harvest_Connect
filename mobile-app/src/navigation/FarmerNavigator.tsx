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

const FarmerHomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={navStyles.header}>
      <Stack.Screen name="Home" component={FarmerHomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="AddProduce" component={AddProduceScreen} options={{ title: 'Add Produce' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="StorageBook" component={StorageBookScreen} options={{ title: 'Book Storage' }} />
      <Stack.Screen name="TransportRequest" component={TransportRequestScreen} options={{ title: 'Request Transport' }} />
    </Stack.Navigator>
  );
};

const FarmerNavigator: React.FC = () => {
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
        component={FarmerHomeStack}
        options={{
          title: 'Home',
          tabBarIcon: tabIcon(0x1f3e0),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={StorageBrowseScreen}
        options={{
          title: 'Storage',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f50d),
        }}
      />
      <Tab.Screen
        name="StorageBookingsTab"
        component={MyStorageBookingsScreen}
        options={{
          title: 'My Storage',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f4e6),
        }}
      />
      <Tab.Screen
        name="TransportTab"
        component={TransportBrowseScreen}
        options={{
          title: 'Transport',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f69a),
        }}
      />
      <Tab.Screen
        name="MyTransportTab"
        component={MyTransportBookingsScreen}
        options={{
          title: 'My Trips',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f5fa),
        }}
      />
      <Tab.Screen
        name="ListingsTab"
        component={MyListingsScreen}
        options={{
          title: 'Listings',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f33e),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={IncomingOrdersScreen}
        options={{
          title: 'Orders',
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

export default FarmerNavigator;
