import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Screen } from '../../ui/Screen';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.subtitle}>Manage your session</Text>
      </View>

      <GlassCard strength="strong">
        <View style={styles.row}>
          <Text style={styles.k}>Name</Text>
          <Text style={styles.v}>{user?.fullName ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.k}>Phone</Text>
          <Text style={styles.v}>{user?.phoneNumber ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.k}>Role</Text>
          <Text style={styles.v}>{user?.role ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.k}>Region</Text>
          <Text style={styles.v}>{user?.region ?? '-'}</Text>
        </View>
      </GlassCard>

      <GlassButton title="Logout" onPress={logout} variant="secondary" style={{ marginTop: spacing.lg }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text },
  subtitle: { marginTop: 6, color: colors.muted, fontSize: 14, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  k: { color: colors.muted, fontWeight: '700' },
  v: { color: colors.text, fontWeight: '800' },
});

export default ProfileScreen;

