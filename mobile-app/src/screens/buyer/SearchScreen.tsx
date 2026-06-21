import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { produceApi } from '../../api/produceApi';
import { ProduceListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  const runSearch = async () => {
    try {
      setIsLoading(true);
      const data = await produceApi.getListings();
      setListings(data.filter((l) => l.status === 'AVAILABLE'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (l) => l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
    );
  }, [listings, query]);

  const renderItem = ({ item }: { item: ProduceListing }) => (
    <TouchableOpacity
      style={{ marginBottom: spacing.md }}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProduceDetail', { listingId: item.id })}
    >
      <GlassCard>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.meta}>{item.category} • {item.location}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>GHS {item.price_per_kg}/kg</Text>
          <Text style={styles.meta}>{item.quantity_kg}kg</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find produce fast</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search produce, category…"
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
        autoCapitalize="none"
        onSubmitEditing={runSearch}
        returnKeyType="search"
      />

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        onRefresh={runSearch}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: colors.muted, textAlign: 'center' }}>
              {listings.length === 0 ? 'Type a search and press Enter.' : 'No results.'}
            </Text>
          </View>
        }
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
  itemTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  price: { color: colors.accent, fontSize: 16, fontWeight: '800' },
});

export default SearchScreen;

