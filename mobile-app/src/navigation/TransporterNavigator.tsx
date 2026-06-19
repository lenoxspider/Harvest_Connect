// src/navigation/TransporterNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import AddTruckScreen from '../screens/transporter/AddTruckScreen';
import MyListingsScreen from '../screens/transporter/MyListingsScreen';
import IncomingBookingsScreen from '../screens/transporter/IncomingBookingsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import { navStyles } from './navStyles';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TransporterTabs: React.FC = () => {
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
        component={TransporterHomeScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>🏡</Text> }}
      />
      <Tab.Screen
        name="My Trucks"
        component={MyListingsScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>🚚</Text> }}
      />
      <Tab.Screen
        name="Bookings"
        component={IncomingBookingsScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>📦</Text> }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
};

const TransporterNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={navStyles.header}>
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
