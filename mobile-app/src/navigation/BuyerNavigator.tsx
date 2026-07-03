// src/navigation/BuyerNavigator.tsx
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import ProduceListScreen from '../screens/buyer/ProduceListScreen';
import ProduceDetailScreen from '../screens/buyer/ProduceDetailScreen';
import MyOrdersScreen from '../screens/buyer/MyOrdersScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import TrackingScreen from '../screens/common/TrackingScreen';
import CartScreen from '../screens/buyer/CartScreen';
import { buyerApi } from '../api/buyerApi';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon =
  (codePoint: number) =>
  ({ focused }: { focused: boolean }) => (
    <Text style={{ opacity: focused ? 1 : 0.7, fontSize: 20 }}>
      {String.fromCodePoint(codePoint)}
    </Text>
  );

const buyerHeader = {
  headerStyle: { backgroundColor: '#4A148C' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '800' as const },
  headerShadowVisible: false,
};

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={buyerHeader}>
      <Stack.Screen name="Home" component={BuyerHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
};

const BrowseStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={buyerHeader}>
      <Stack.Screen name="ProduceList" component={ProduceListScreen} options={{ title: 'Browse Produce' }} />
      <Stack.Screen name="ProduceDetail" component={ProduceDetailScreen} options={{ title: 'Produce Details' }} />
    </Stack.Navigator>
  );
};

const BuyerNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartBadge = async () => {
      const count = await buyerApi.getCartCount();
      setCartCount(count);
    };
    fetchCartBadge();
    const interval = setInterval(fetchCartBadge, 3000); // refresh cart badge periodically
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontWeight: '800', fontSize: 10 },
        tabBarActiveTintColor: '#7B1FA2',
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
        component={HomeStack}
        options={{
          title: 'Home',
          tabBarIcon: tabIcon(0x1f3e0),
        }}
      />
      <Tab.Screen
        name="BrowseTab"
        component={BrowseStack}
        options={{
          title: 'Browse',
          tabBarIcon: tabIcon(0x1f50d),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarIcon: tabIcon(0x1f6d2),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#7B1FA2', color: '#FFFFFF' },
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={MyOrdersScreen}
        options={{
          title: 'Orders',
          ...buyerHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f4e6),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          title: 'Account',
          ...buyerHeader,
          headerShown: true,
          tabBarIcon: tabIcon(0x1f464),
        }}
      />
    </Tab.Navigator>
  );
};

export default BuyerNavigator;
