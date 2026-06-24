import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { transportApi } from '../../api/transportApi';
import { TransportBooking } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const MyTransportBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [items, setItems] = useState<TransportBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await transportApi.getMyBookings();
      setItems(data);
    } catch (e) {
      console.error('Error fetching my transport bookings:', e);
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

  const renderItem = ({ item }: { item: TransportBooking }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Tracking', { bookingId: item.id, type: 'transport' })}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Request #{item.id}</Text>
        <Text style={styles.meta}>From: {item.pickup_location}</Text>
        <Text style={styles.meta}>To: {item.delivery_location}</Text>
        <Text style={styles.meta}>Date: {item.scheduled_date}</Text>
        <Text style={styles.meta}>Status: {item.status}</Text>
        <Text style={styles.price}>Est. cost: GHS {item.total_cost}</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Transport Requests</Text>
        <Text style={styles.headerSub}>{isLoading ? 'Loading...' : 'Track your transport requests'}</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No requests yet.'}</Text>
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

export default MyTransportBookingsScreen;
