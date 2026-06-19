import { colors } from '../theme/colors';

export const navStyles = {
  header: {
    headerStyle: { backgroundColor: colors.bg2 },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '800' as const },
    headerShadowVisible: false,
  },
  tabBar: {
    tabBarActiveTintColor: colors.text,
    tabBarInactiveTintColor: 'rgba(234, 240, 255, 0.55)',
    tabBarStyle: {
      backgroundColor: 'rgba(10, 14, 26, 0.92)',
      borderTopColor: 'rgba(255, 255, 255, 0.10)',
      borderTopWidth: 1,
    },
  },
};

