import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { GlassBackground } from './GlassBackground';
import { spacing } from '../theme/spacing';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll }: Props) {
  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </SafeAreaView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
});

