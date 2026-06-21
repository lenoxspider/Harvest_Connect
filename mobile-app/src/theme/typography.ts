import { Platform } from 'react-native';

export const typography = {
  fontFamily:
    Platform.OS === 'ios' ? 'System' : Platform.OS === 'android' ? 'sans-serif' : undefined,
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
  h2: {
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  small: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
};

