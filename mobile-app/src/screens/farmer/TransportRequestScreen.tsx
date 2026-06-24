import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { transportApi } from '../../api/transportApi';
import { TruckListing } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassButton } from '../../ui/GlassButton';
import { GlassCard } from '../../ui/GlassCard';
import { GlassInput } from '../../ui/GlassInput';
import { Screen } from '../../ui/Screen';

type RouteParams = {
  TransportRequest: { truck: TruckListing };
};

const TransportRequestScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'TransportRequest'>>();
  const truck = route.params.truck;

  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    if (!pickup || !delivery || !date) {
      Alert.alert('Error', 'Fill pickup, delivery, and date (YYYY-MM-DD)');
      return;
    }
    setIsLoading(true);
    try {
      await transportApi.bookTransport({
        truck_id: truck.id,
        pickup_location: pickup,
        delivery_location: delivery,
        scheduled_date: date,
      });
      Alert.alert('Success', 'Transport request sent');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'Request failed';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Request Transport</Text>
        <Text style={styles.subtitle}>{truck.truck_type}</Text>
      </View>

      <GlassCard>
        <Text style={styles.meta}>Location: {truck.location}</Text>
        <Text style={styles.meta}>Capacity: {truck.capacity_kg} kg</Text>
        <Text style={styles.meta}>Rate: GHS {truck.price_per_km}/km</Text>
      </GlassCard>

      <View style={{ height: spacing.lg }} />

      <GlassCard strength="strong">
        <GlassInput label="Pickup location" value={pickup} onChangeText={setPickup} editable={!isLoading} />
        <GlassInput label="Delivery location" value={delivery} onChangeText={setDelivery} editable={!isLoading} />
        <GlassInput
          label="Scheduled date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          placeholder="2026-06-25"
          editable={!isLoading}
        />
        <GlassButton
          title={isLoading ? 'Submitting...' : 'Submit request'}
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

export default TransportRequestScreen;

