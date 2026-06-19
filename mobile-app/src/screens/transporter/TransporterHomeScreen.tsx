import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Screen } from '../../ui/Screen';

const TransporterHomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.fullName}.</Text>
        <Text style={styles.subtitle}>Manage your transport listings</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity activeOpacity={0.9} style={styles.tile}>
          <GlassCard>
            <Text style={styles.tileTitle}>Add Truck</Text>
            <Text style={styles.tileDesc}>Create a truck listing</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.tile}>
          <GlassCard>
            <Text style={styles.tileTitle}>My Listings</Text>
            <Text style={styles.tileDesc}>View your available trucks</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.tile}>
          <GlassCard>
            <Text style={styles.tileTitle}>Incoming Bookings</Text>
            <Text style={styles.tileDesc}>Accept booking requests</Text>
          </GlassCard>
        </TouchableOpacity>
      </View>

      <GlassButton title="Logout" onPress={logout} variant="secondary" style={{ marginTop: spacing.lg }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text },
  subtitle: { marginTop: 6, color: colors.muted, fontSize: 14, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  tile: {
    width: '48%',
  },
  tileTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  tileDesc: { marginTop: 6, color: colors.muted, lineHeight: 18 },
});

export default TransporterHomeScreen;

