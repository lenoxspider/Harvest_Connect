import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { produceApi } from '../../api/produceApi';
import { paymentApi } from '../../api/paymentApi';
import { ProduceListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { GlassInput } from '../../ui/GlassInput';
import { Screen } from '../../ui/Screen';

type RouteParams = {
  ProduceDetail: { listingId: string };
};

const ProduceDetailScreen: React.FC = () => {
  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const route = useRoute<NativeStackScreenProps<RouteParams>['route']>();

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

  const quantityNum = useMemo(() => {
    const n = Number(quantity);
    return Number.isFinite(n) ? n : 0;
  }, [quantity]);

  const total = useMemo(() => {
    if (!listing || quantityNum <= 0) return 0;
    return quantityNum * listing.price_per_kg;
  }, [listing, quantityNum]);

  const handleBuyNow = async () => {
    if (!listing || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    if (quantityNum > listing.quantity_kg) {
      Alert.alert('Error', `Only ${listing.quantity_kg}kg available`);
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy ${quantityNum}kg of ${listing.title} for GHS ${total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsOrdering(true);
            try {
              const order = await produceApi.placeOrder({
                listing_id: listing.id,
                quantity_kg: quantityNum,
              });

              await paymentApi.initiatePayment({
                order_id: order.id,
                amount: Number(total.toFixed(2)),
              });

              Alert.alert('Success', 'Order placed! Awaiting confirmation.');
              setQuantity('');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Order failed');
            } finally {
              setIsOrdering(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>{listing?.title ?? (isLoading ? 'Loading…' : 'Not found')}</Text>
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
            {listing.description ? (
              <Text style={styles.desc}>{listing.description}</Text>
            ) : null}
          </GlassCard>

          <View style={{ height: spacing.lg }} />

          <GlassCard strength="strong">
            <Text style={styles.sectionTitle}>Order</Text>

            <GlassInput
              label="Quantity (kg)"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              editable={!isOrdering}
              placeholder="e.g. 5"
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>GHS {total > 0 ? total.toFixed(2) : '0.00'}</Text>
            </View>

            <GlassButton
              title={isOrdering ? 'Processing…' : 'Buy Now'}
              onPress={handleBuyNow}
              loading={isOrdering}
              disabled={!quantity || quantityNum <= 0}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </>
      ) : (
        <Text style={{ marginTop: spacing.md, color: colors.muted }}>
          {isLoading ? 'Loading details…' : 'Could not load this listing.'}
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
  sectionTitle: { ...typography.h2, fontSize: 18, color: colors.text, marginBottom: 4 },
  totalRow: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(124, 255, 178, 0.10)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: colors.text, fontWeight: '800' },
  totalValue: { color: colors.accent, fontWeight: '900', fontSize: 16 },
});

export default ProduceDetailScreen;

