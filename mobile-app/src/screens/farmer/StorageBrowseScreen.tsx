import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { storageApi } from '../../api/storageApi';
import { StorageListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const StorageBrowseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [location, setLocation] = useState('');
  const [minTons, setMinTons] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [listings, setListings] = useState<StorageListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await storageApi.getListings({
        location: location.trim() || undefined,
        available_tons: minTons ? Number(minTons) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
      });
      setListings(data);
    } catch (e) {
      console.error('Error loading storage listings:', e);
      Alert.alert('Error', 'Could not load storage listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => listings.filter((l) => l.is_available), [listings]);

  const renderItem = ({ item }: { item: StorageListing }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('StorageBook', { listing: item })}
    >
      <GlassCard style={styles.card}>
        <Text style={styles.title} numberOfLines={1}>
          {item.facility_name}
        </Text>
        <Text style={styles.meta}>Location: {item.location}</Text>
        <Text style={styles.meta}>
          Space left: {item.available_tons}/{item.capacity_tons} tons
        </Text>
        <Text style={styles.price}>GHS {item.price_per_ton_per_day}/ton/day</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Storage</Text>
        <Text style={styles.headerSub}>Browse and book cold storage</Text>
      </View>

      <GlassCard style={styles.filters} strength="strong">
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Location (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <TextInput
          value={minTons}
          onChangeText={setMinTons}
          placeholder="Min available tons (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          value={maxPrice}
          onChangeText={setMaxPrice}
          placeholder="Max price per ton/day (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          keyboardType="numeric"
        />
        <TouchableOpacity activeOpacity={0.9} style={styles.filterBtn} onPress={load}>
          <Text style={styles.filterBtnText}>{isLoading ? 'Loading...' : 'Apply Filters'}</Text>
        </TouchableOpacity>
      </GlassCard>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={load}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No storage listings found.'}</Text>
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
  filters: { marginBottom: spacing.md },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(10, 14, 26, 0.55)',
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  filterBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 178, 0.35)',
    backgroundColor: 'rgba(124, 255, 178, 0.18)',
  },
  filterBtnText: { color: colors.text, fontWeight: '900' },
  list: { paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  title: { color: colors.text, fontWeight: '900', fontSize: 16 },
  meta: { marginTop: 6, color: colors.muted, fontWeight: '700' },
  price: { marginTop: 8, color: colors.accent, fontWeight: '900' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.muted, fontWeight: '700' },
});

export default StorageBrowseScreen;

