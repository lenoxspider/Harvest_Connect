import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { storageApi } from '../../api/storageApi';
import { StorageBooking } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const MyStorageBookingsScreen: React.FC = () => {
  const [items, setItems] = useState<StorageBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await storageApi.getMyBookings();
      setItems(data);
    } catch (e) {
      console.error('Error fetching my bookings:', e);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: StorageBooking }) => (
    <GlassCard style={styles.card}>
      <Text style={styles.title}>Booking #{item.id}</Text>
      <Text style={styles.meta}>Quantity: {item.quantity_tons} tons</Text>
      <Text style={styles.meta}>
        Dates: {item.start_date} → {item.end_date}
      </Text>
      <Text style={styles.meta}>Status: {item.status}</Text>
      <Text style={styles.price}>Total: GHS {item.total_price}</Text>
    </GlassCard>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Storage Bookings</Text>
        <Text style={styles.headerSub}>{isLoading ? 'Loading...' : 'Track your cold storage bookings'}</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No bookings yet.'}</Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  headerTitle: { ...typography.h2, color: colors.text },
  headerSub: { marginTop: 6, color: colors.muted, fontWeight: '600' },
  list: { paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  title: { color: colors.text, fontWeight: '900', fontSize: 16 },
  meta: { marginTop: 6, color: colors.muted, fontWeight: '700' },
  price: { marginTop: 8, color: colors.accent, fontWeight: '900' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.muted, fontWeight: '700' },
});

export default MyStorageBookingsScreen;

