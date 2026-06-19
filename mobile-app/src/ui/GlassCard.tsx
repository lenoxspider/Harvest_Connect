import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  strength?: 'normal' | 'strong';
};

export function GlassCard({ children, style, strength = 'normal' }: Props) {
  return (
    <View
      style={[
        styles.card,
        strength === 'strong' ? styles.strong : styles.normal,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  normal: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
  },
  strong: {
    backgroundColor: colors.glassStrong,
    borderColor: colors.borderStrong,
  },
});

