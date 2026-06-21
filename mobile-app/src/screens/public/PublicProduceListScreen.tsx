import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { produceApi } from '../../api/produceApi';
import { ProduceListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const PublicProduceListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    void fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const data = await produceApi.getListings();
      setListings(data.filter((listing) => listing.status === 'AVAILABLE'));
    } catch (error) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', 'Could not load produce listings');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(q) || listing.category.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  const renderListing = ({ item }: { item: ProduceListing }) => (
    <TouchableOpacity
      style={styles.cardTouchable}
      onPress={() => navigation.navigate('PublicProduceDetail', { listingId: item.id })}
      activeOpacity={0.9}
    >
      <GlassCard>
        <View style={styles.listingHeader}>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.tag}>
            <Text style={styles.tagText} numberOfLines={1}>
              {item.category}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.price}>GHS {item.price_per_kg}/kg</Text>
          <Text style={styles.meta}>{item.quantity_kg}kg</Text>
        </View>

        <Text style={styles.meta}>Location: {item.location}</Text>
        <Text style={styles.hint}>Login to order</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Produce</Text>
        <Text style={styles.subtitle}>Browse public listings</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search produce, category..."
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
      />

      <FlatList
        data={filteredListings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : searchQuery ? 'No matching produce found.' : 'No produce available yet.'}
            </Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchListings}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text },
  subtitle: { marginTop: 6, color: colors.muted, fontSize: 14, fontWeight: '600' },
  searchInput: {
    height: 52,
    backgroundColor: 'rgba(10, 14, 26, 0.55)',
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    marginBottom: spacing.md,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  cardTouchable: {
    marginBottom: spacing.md,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  tag: {
    marginLeft: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 200, 255, 0.25)',
    backgroundColor: 'rgba(92, 200, 255, 0.10)',
  },
  tagText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  hint: { marginTop: 10, color: colors.muted, fontWeight: '700' },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
});

export default PublicProduceListScreen;
