import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { storageApi } from '../../api/storageApi';
import { paymentApi } from '../../api/paymentApi';
import { StorageListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassButton } from '../../ui/GlassButton';
import { GlassCard } from '../../ui/GlassCard';
import { GlassInput } from '../../ui/GlassInput';
import { Screen } from '../../ui/Screen';
import { PaystackModal } from '../../ui/PaystackModal';
import { useAuth } from '../../context/AuthContext';

type RouteParams = {
  StorageBook: { listing: StorageListing };
};

const StorageBookScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'StorageBook'>>();
  const listing = route.params.listing;

  const [quantityTons, setQuantityTons] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paystackVisible, setPaystackVisible] = useState(false);

  const qty = useMemo(() => Number(quantityTons) || 0, [quantityTons]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Number.isNaN(diffDays) ? 0 : Math.max(1, diffDays);
  }, [startDate, endDate]);

  const total = useMemo(() => {
    return qty * listing.price_per_ton_per_day * (days || 1);
  }, [qty, listing.price_per_ton_per_day, days]);

  const submit = async () => {
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Enter a valid quantity in tons');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Enter start and end dates (YYYY-MM-DD)');
      return;
    }
    if (qty > listing.available_tons) {
      Alert.alert('Error', `Only ${listing.available_tons} tons available`);
      return;
    }

    Alert.alert(
      'Confirm Booking Payment',
      `Book ${qty} tons for ${days} days. Total price GHS ${total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm & Pay', onPress: () => setPaystackVisible(true) }
      ]
    );
  };

  const handlePaymentSuccess = async (reference: string) => {
    setPaystackVisible(false);
    setIsLoading(true);
    try {
      const booking = await storageApi.bookStorage({
        storage_id: listing.id,
        quantity_tons: qty,
        start_date: startDate,
        end_date: endDate,
      });

      // Register payment
      await paymentApi.initiatePayment({
        order_id: booking.id,
        amount: Number(total.toFixed(2)),
      });

      Alert.alert('Success', `Storage booked successfully! Reference: ${reference}`);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Success', 'Payment completed, but registering storage booking on backend failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Book Storage</Text>
        <Text style={styles.subtitle}>{listing.facility_name}</Text>
      </View>

      <GlassCard>
        <Text style={styles.meta}>Location: {listing.location}</Text>
        <Text style={styles.meta}>
          Space left: {listing.available_tons}/{listing.capacity_tons} tons
        </Text>
        <Text style={styles.meta}>Price: GHS {listing.price_per_ton_per_day}/ton/day</Text>
      </GlassCard>

      <View style={{ height: spacing.lg }} />

      <GlassCard strength="strong">
        <GlassInput
          label="Quantity (tons)"
          value={quantityTons}
          onChangeText={setQuantityTons}
          keyboardType="numeric"
          placeholder="e.g. 2"
          editable={!isLoading}
        />
        <GlassInput
          label="Start date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2026-06-24"
          editable={!isLoading}
        />
        <GlassInput
          label="End date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
          placeholder="2026-06-26"
          editable={!isLoading}
        />

        {total > 0 && (
          <View style={{ marginVertical: spacing.sm, padding: spacing.sm, borderRadius: 8, backgroundColor: 'rgba(46, 125, 50, 0.08)' }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
              Duration: {days} {days === 1 ? 'day' : 'days'}
            </Text>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 14, marginTop: 4 }}>
              Total Cost: GHS {total.toFixed(2)}
            </Text>
          </View>
        )}

        <GlassButton
          title={isLoading ? 'Submitting...' : 'Book & Pay'}
          onPress={submit}
          loading={isLoading}
          disabled={isLoading || qty <= 0}
          style={{ marginTop: spacing.md }}
        />
      </GlassCard>

      <PaystackModal
        visible={paystackVisible}
        amount={total}
        email={`${user?.fullName?.replace(/\s+/g, '').toLowerCase() || 'farmer'}@harvestconnect.com`}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setPaystackVisible(false)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text },
  subtitle: { marginTop: 6, color: colors.muted, fontWeight: '700' },
  meta: { marginTop: 6, color: colors.muted, fontWeight: '700' },
});

export default StorageBookScreen;

