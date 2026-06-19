import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const StorageOwnerHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.fullName}.</Text>
        <Text style={styles.subtitle}>Manage facilities and bookings</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity activeOpacity={0.9} style={styles.tile} onPress={() => navigation.navigate('AddStorage')}>
          <GlassCard>
            <Text style={styles.tileTitle}>Add Storage</Text>
            <Text style={styles.tileDesc}>Create a facility listing</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.tile} onPress={() => navigation.navigate('FacilitiesTab')}>
          <GlassCard>
            <Text style={styles.tileTitle}>My Facilities</Text>
            <Text style={styles.tileDesc}>View and manage facilities</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.tile} onPress={() => navigation.navigate('BookingsTab')}>
          <GlassCard>
            <Text style={styles.tileTitle}>Bookings</Text>
            <Text style={styles.tileDesc}>Confirm incoming bookings</Text>
          </GlassCard>
        </TouchableOpacity>
      </View>
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

export default StorageOwnerHomeScreen;
