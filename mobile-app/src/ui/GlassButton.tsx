import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
};

export function GlassButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.9}
    >
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: 'rgba(124, 255, 178, 0.18)',
    borderColor: 'rgba(124, 255, 178, 0.35)',
  },
  secondary: {
    backgroundColor: 'rgba(92, 200, 255, 0.14)',
    borderColor: 'rgba(92, 200, 255, 0.25)',
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

