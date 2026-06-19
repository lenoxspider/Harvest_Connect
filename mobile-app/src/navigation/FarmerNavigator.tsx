// src/navigation/FarmerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import AddProduceScreen from '../screens/farmer/AddProduceScreen';
import MyListingsScreen from '../screens/farmer/MyListingsScreen';
import IncomingOrdersScreen from '../screens/farmer/IncomingOrdersScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import { navStyles } from './navStyles';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const FarmerTabs: React.FC = () => {
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
        component={FarmerHomeScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>🏡</Text> }}
      />
      <Tab.Screen
        name="My Listings"
        component={MyListingsScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>🌾</Text> }}
      />
      <Tab.Screen
        name="Orders"
        component={IncomingOrdersScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>🧾</Text> }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ opacity: focused ? 1 : 0.7 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
};

const FarmerNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={navStyles.header}>
      <Stack.Screen 
        name="FarmerDashboard" 
        component={FarmerTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddProduce" 
        component={AddProduceScreen} 
        options={{ title: 'Add New Produce' }}
      />
    </Stack.Navigator>
  );
};

export default FarmerNavigator;
