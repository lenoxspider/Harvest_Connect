import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { transportApi } from '../../api/transportApi';
import { TruckListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const TransportBrowseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [query, setQuery] = useState('');
  const [trucks, setTrucks] = useState<TruckListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await transportApi.getTrucks();
      setTrucks(data);
    } catch (e) {
      console.error('Error loading trucks:', e);
      Alert.alert('Error', 'Could not load trucks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trucks;
    return trucks.filter(
      (t) =>
        t.truck_type.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
    );
  }, [trucks, query]);

  const renderItem = ({ item }: { item: TruckListing }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('TransportRequest', { truck: item })}>
      <GlassCard style={styles.card}>
        <Text style={styles.title} numberOfLines={1}>
          {item.truck_type}
        </Text>
        <Text style={styles.meta}>Location: {item.location}</Text>
        <Text style={styles.meta}>Capacity: {item.capacity_kg} kg</Text>
        <Text style={styles.price}>GHS {item.price_per_km}/km</Text>
        <Text style={styles.meta}>Status: {item.status}</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Request Transport</Text>
        <Text style={styles.headerSub}>Choose a truck and submit pickup/dropoff</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by type or location..."
        placeholderTextColor={colors.muted}
        style={styles.search}
      />

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={load}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No trucks found.'}</Text>
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
  search: {
    height: 52,
    backgroundColor: 'rgba(10, 14, 26, 0.55)',
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  list: { paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  title: { color: colors.text, fontWeight: '900', fontSize: 16 },
  meta: { marginTop: 6, color: colors.muted, fontWeight: '700' },
  price: { marginTop: 8, color: colors.accent, fontWeight: '900' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.muted, fontWeight: '700' },
});

export default TransportBrowseScreen;

