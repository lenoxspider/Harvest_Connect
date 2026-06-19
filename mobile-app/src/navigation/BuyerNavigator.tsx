// src/navigation/BuyerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import ProduceListScreen from '../screens/buyer/ProduceListScreen';
import ProduceDetailScreen from '../screens/buyer/ProduceDetailScreen';
import MyOrdersScreen from '../screens/buyer/MyOrdersScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import { navStyles } from './navStyles';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BuyerStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={navStyles.header}>
      <Stack.Screen name="BuyerHome" component={BuyerHomeScreen} options={{ title: 'Marketplace' }} />
      <Stack.Screen name="ProduceList" component={ProduceListScreen} options={{ title: 'Produce' }} />
      <Stack.Screen name="ProduceDetail" component={ProduceDetailScreen} options={{ title: 'Details' }} />
    </Stack.Navigator>
  );
};

const BuyerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        ...navStyles.tabBar,
        headerShown: false,
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="MarketTab"
        component={BuyerStack}
        options={{
          title: 'Market',
          tabBarIcon: ({ focused }) => (
            <Text style={{ opacity: focused ? 1 : 0.7 }}>🛒</Text>
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={MyOrdersScreen}
        options={{
          title: 'Orders',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <Text style={{ opacity: focused ? 1 : 0.7 }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          title: 'Account',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <Text style={{ opacity: focused ? 1 : 0.7 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BuyerNavigator;
