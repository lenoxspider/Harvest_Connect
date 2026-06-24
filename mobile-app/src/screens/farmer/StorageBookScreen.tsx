import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { storageApi } from '../../api/storageApi';
import { StorageListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassButton } from '../../ui/GlassButton';
import { GlassCard } from '../../ui/GlassCard';
import { GlassInput } from '../../ui/GlassInput';
import { Screen } from '../../ui/Screen';

type RouteParams = {
  StorageBook: { listing: StorageListing };
};

const StorageBookScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'StorageBook'>>();
  const listing = route.params.listing;

  const [quantityTons, setQuantityTons] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const qty = useMemo(() => Number(quantityTons) || 0, [quantityTons]);

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

    setIsLoading(true);
    try {
      await storageApi.bookStorage({
        storage_id: listing.id,
        quantity_tons: qty,
        start_date: startDate,
        end_date: endDate,
      });
      Alert.alert('Success', 'Booking request sent');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'Booking failed';
      Alert.alert('Error', msg);
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

        <GlassButton
          title={isLoading ? 'Submitting...' : 'Book'}
          onPress={submit}
          loading={isLoading}
          disabled={isLoading}
          style={{ marginTop: spacing.md }}
        />
      </GlassCard>
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

