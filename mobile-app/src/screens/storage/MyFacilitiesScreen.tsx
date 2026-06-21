import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { storageApi } from '../../api/storageApi';
import { StorageListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const MyFacilitiesScreen: React.FC = () => {
  const [facilities, setFacilities] = useState<StorageListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const data = await storageApi.getMyFacilities();
      setFacilities(data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setFacilities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFacility = ({ item }: { item: StorageListing }) => {
    const used = Math.max(0, item.capacity_tons - item.available_tons);
    const usedPct = item.capacity_tons > 0 ? Math.round((used / item.capacity_tons) * 100) : 0;

    return (
      <GlassCard style={styles.facilityCard}>
        <Text style={styles.name}>{item.facility_name}</Text>
        <Text style={styles.location}>Location: {item.location}</Text>

        <View style={{ height: spacing.sm }} />

        <Text style={styles.meta}>Capacity: {item.capacity_tons} tons</Text>
        <Text style={styles.meta}>Space left: {item.available_tons} tons</Text>
        <Text style={styles.meta}>Used: {used} tons ({usedPct}%)</Text>

        <View style={{ height: spacing.sm }} />

        <Text style={styles.price}>GHS {item.price_per_ton_per_day}/ton/day</Text>
        {item.temperature_range ? <Text style={styles.meta}>Temp: {item.temperature_range}</Text> : null}
        <Text style={styles.meta}>{item.is_available ? 'Available' : 'Unavailable'}</Text>
      </GlassCard>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>My Facilities</Text>
        <Text style={styles.subtitle}>
          {isLoading ? 'Loading...' : 'Storage space remaining per facility'}
        </Text>
      </View>

      <FlatList
        data={facilities}
        renderItem={renderFacility}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No storage facilities added yet'}
            </Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchFacilities}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text },
  subtitle: { marginTop: 6, color: colors.muted, fontSize: 14, fontWeight: '600' },
  listContainer: { paddingBottom: spacing.xl },
  facilityCard: { padding: 16, marginBottom: spacing.md },
  name: { fontSize: 18, fontWeight: '900', color: colors.text },
  location: { marginTop: 6, fontSize: 14, color: colors.muted, fontWeight: '700' },
  meta: { marginTop: 4, color: colors.muted, fontWeight: '700' },
  price: { marginTop: 6, fontSize: 15, fontWeight: '900', color: colors.accent },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: colors.muted, fontWeight: '700', textAlign: 'center' },
});

export default MyFacilitiesScreen;

