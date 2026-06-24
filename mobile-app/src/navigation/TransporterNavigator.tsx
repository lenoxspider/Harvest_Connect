// src/navigation/TransporterNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import AddTruckScreen from '../screens/transporter/AddTruckScreen';
import MyListingsScreen from '../screens/transporter/MyListingsScreen';
import IncomingBookingsScreen from '../screens/transporter/IncomingBookingsScreen';
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

const TransporterHomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={navStyles.header}>
      <Stack.Screen name="Home" component={TransporterHomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="AddTruck" component={AddTruckScreen} options={{ title: 'Add Truck' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Tracking' }} />
    </Stack.Navigator>
  );
};

const TransporterNavigator: React.FC = () => {
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
        component={TransporterHomeStack}
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
        name="TrucksTab"
        component={MyListingsScreen}
        options={{
          title: 'Trucks',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f69a),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={IncomingBookingsScreen}
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

export default TransporterNavigator;
