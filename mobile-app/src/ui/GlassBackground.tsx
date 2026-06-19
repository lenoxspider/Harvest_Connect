import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  children: React.ReactNode;
};

export function GlassBackground({ children }: Props) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.orbA} />
      <View pointerEvents="none" style={styles.orbB} />
      <View pointerEvents="none" style={styles.orbC} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  orbA: {
    position: 'absolute',
    top: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(92, 200, 255, 0.25)',
  },
  orbB: {
    position: 'absolute',
    bottom: -160,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(124, 255, 178, 0.20)',
  },
  orbC: {
    position: 'absolute',
    top: 220,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 92, 138, 0.12)',
  },
});

