import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { produceApi } from '../../api/produceApi';
import { ProduceListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const ProduceListScreen: React.FC = () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const renderListing = ({ item }: { item: ProduceListing }) => (
    <TouchableOpacity
      style={styles.cardTouchable}
      onPress={() => navigation.navigate('ProduceDetail', { listingId: item.id })}
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
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Available Produce</Text>
        <Text style={styles.subtitle}>Tap an item to view details</Text>
      </View>

      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading…' : 'No produce available at the moment.'}
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
    marginBottom: 8,
  },
  price: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 13, fontWeight: '600' },
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

export default ProduceListScreen;

