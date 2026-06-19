import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

type FarmerStackParamList = {
  FarmerDashboard: undefined;
  AddProduce: undefined;
};

const FarmerHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.fullName}.</Text>
        <Text style={styles.subtitle}>Manage your listings and orders</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduce')} activeOpacity={0.9} style={styles.tile}>
          <GlassCard>
            <Text style={styles.tileTitle}>Add Produce</Text>
            <Text style={styles.tileDesc}>Create a new listing</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.tile}>
          <GlassCard>
            <Text style={styles.tileTitle}>My Listings</Text>
            <Text style={styles.tileDesc}>View and edit listings</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.tile}>
          <GlassCard>
            <Text style={styles.tileTitle}>Incoming Orders</Text>
            <Text style={styles.tileDesc}>Accept and manage orders</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.tile}>
          <GlassCard>
            <Text style={styles.tileTitle}>Book Storage</Text>
            <Text style={styles.tileDesc}>Find cold storage nearby</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.tile}>
          <GlassCard>
            <Text style={styles.tileTitle}>Book Transport</Text>
            <Text style={styles.tileDesc}>Arrange delivery logistics</Text>
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

export default FarmerHomeScreen;

