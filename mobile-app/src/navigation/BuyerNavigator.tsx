// src/navigation/BuyerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import ExploreHomeScreen from '../screens/common/ExploreHomeScreen';
import ProduceListScreen from '../screens/buyer/ProduceListScreen';
import ProduceDetailScreen from '../screens/buyer/ProduceDetailScreen';
import MyOrdersScreen from '../screens/buyer/MyOrdersScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import VideosScreen from '../screens/common/VideosScreen';
import MapsScreen from '../screens/common/MapsScreen';
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

const ExploreStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...navStyles.header,
      }}
    >
      <Stack.Screen name="ExploreHome" component={ExploreHomeScreen} options={{ title: 'Explore' }} />
      <Stack.Screen name="ProduceList" component={ProduceListScreen} options={{ title: 'Produce' }} />
      <Stack.Screen name="ProduceDetail" component={ProduceDetailScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
};

const BuyerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        ...navStyles.tabBar,
        tabBarLabelStyle: { fontWeight: '800' },
      }}
    >
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          title: 'Explore',
          tabBarIcon: tabIcon(0x1f50e),
        }}
      />
      <Tab.Screen
        name="VideosTab"
        component={VideosScreen}
        options={{
          title: 'Videos',
          tabBarIcon: tabIcon(0x1f3a5),
        }}
      />
      <Tab.Screen
        name="MapsTab"
        component={MapsScreen}
        options={{
          title: 'Maps',
          tabBarIcon: tabIcon(0x1f5fa),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={MyOrdersScreen}
        options={{
          title: 'Bookings',
          tabBarIcon: tabIcon(0x1f4c5),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: tabIcon(0x1f464),
        }}
      />
    </Tab.Navigator>
  );
};

export default BuyerNavigator;
