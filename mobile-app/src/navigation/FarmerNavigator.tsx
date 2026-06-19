// src/navigation/FarmerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import AddProduceScreen from '../screens/farmer/AddProduceScreen';
import MyListingsScreen from '../screens/farmer/MyListingsScreen';
import IncomingOrdersScreen from '../screens/farmer/IncomingOrdersScreen';
import SearchScreen from '../screens/buyer/SearchScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
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
        component={SearchScreen}
        options={{
          title: 'Search',
          ...navStyles.header,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f50d),
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
