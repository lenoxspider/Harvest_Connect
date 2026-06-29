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

const transporterHeader = {
  headerStyle: { backgroundColor: '#E65100' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '800' as const },
  headerShadowVisible: false,
};

const TransporterHomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={transporterHeader}>
      <Stack.Screen name="Home" component={TransporterHomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="AddTruck" component={AddTruckScreen} options={{ title: 'Add Truck' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Tracking' }} />
    </Stack.Navigator>
  );
};

const TransporterNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 10 },
        tabBarActiveTintColor: '#E65100',
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
          ...transporterHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f50d),
        }}
      />
      <Tab.Screen
        name="TrucksTab"
        component={MyListingsScreen}
        options={{
          title: 'Trucks',
          ...transporterHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f69a),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={IncomingBookingsScreen}
        options={{
          title: 'Bookings',
          ...transporterHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f4cb),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          title: 'Account',
          ...transporterHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f464),
        }}
      />
    </Tab.Navigator>
  );
};

export default TransporterNavigator;
