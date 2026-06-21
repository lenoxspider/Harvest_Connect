import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { produceApi } from '../../api/produceApi';
import { ProduceListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Screen } from '../../ui/Screen';

type RouteParams = {
  PublicProduceDetail: { listingId: string };
};

const PublicProduceDetailScreen: React.FC = () => {
  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute<RouteProp<RouteParams, 'PublicProduceDetail'>>();
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    void fetchListing();
  }, []);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const data = await produceApi.getListingById(route.params.listingId);
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Error', 'Could not load produce details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>{listing?.title ?? (isLoading ? 'Loading...' : 'Not found')}</Text>
        {listing ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.category}</Text>
          </View>
        ) : null}
      </View>

      {listing ? (
        <>
          <GlassCard>
            <View style={styles.kvRow}>
              <Text style={styles.kLabel}>Price</Text>
              <Text style={styles.kValue}>GHS {listing.price_per_kg}/kg</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kLabel}>Available</Text>
              <Text style={styles.kValue}>{listing.quantity_kg}kg</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kLabel}>Location</Text>
              <Text style={styles.kValue}>{listing.location}</Text>
            </View>
            {listing.description ? <Text style={styles.desc}>{listing.description}</Text> : null}
          </GlassCard>

          <View style={{ height: spacing.lg }} />

          <GlassCard strength="strong">
            <Text style={styles.sectionTitle}>Ordering</Text>
            <Text style={styles.mutedText}>Login as a BUYER to place an order and pay.</Text>
            <GlassButton title="Login" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.md }} />
          </GlassCard>
        </>
      ) : (
        <Text style={{ marginTop: spacing.md, color: colors.muted }}>
          {isLoading ? 'Loading details...' : 'Could not load this listing.'}
        </Text>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text },
  tag: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 200, 255, 0.25)',
    backgroundColor: 'rgba(92, 200, 255, 0.10)',
  },
  tagText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kLabel: { color: colors.muted, fontWeight: '700' },
  kValue: { color: colors.text, fontWeight: '800' },
  desc: { marginTop: 8, color: colors.muted, lineHeight: 20 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },
  mutedText: { color: colors.muted, fontWeight: '600', lineHeight: 20 },
});

export default PublicProduceDetailScreen;
