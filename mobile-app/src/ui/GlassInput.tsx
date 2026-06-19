import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
} & TextInputProps;

export function GlassInput({ label, containerStyle, style, ...props }: Props) {
  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor={colors.muted}
        autoCapitalize={props.autoCapitalize ?? 'none'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: 'rgba(10, 14, 26, 0.55)',
    color: colors.text,
  },
});

