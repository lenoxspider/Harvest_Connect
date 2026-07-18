import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, Image } from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { transportApi } from '../../api/transportApi';
import { paymentApi } from '../../api/paymentApi';
import { TruckListing } from '../../types';
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
  TransportRequest: { truck: TruckListing };
};

const TransportRequestScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'TransportRequest'>>();
  const truck = route.params.truck;

  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paystackVisible, setPaystackVisible] = useState(false);

  // Estimate a default distance of 120km for transport bookings
  const estimatedDistance = 120;
  const total = truck.price_per_km * estimatedDistance;
  const fee = total * 0.05;
  const grandTotal = total + fee;

  const submit = async () => {
    if (!pickup || !delivery || !date) {
      Alert.alert('Error', 'Fill pickup, delivery, and date (YYYY-MM-DD)');
      return;
    }

    Alert.alert(
      'Confirm Transport Payment',
      `Request transport for an estimated distance of ${estimatedDistance}km. Total price GHS ${grandTotal.toFixed(2)} (includes 5% fee)?`,
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
      const booking = await transportApi.bookTransport({
        truck_id: truck.id,
        pickup_location: pickup,
        delivery_location: delivery,
        scheduled_date: date,
      });

      // Register payment
      await paymentApi.initiatePayment({
        order_id: booking.id,
        amount: Number(grandTotal.toFixed(2)),
        transaction_type: 'TRANSPORT',
      });

      Alert.alert('Success', `Transport requested and paid! Reference: ${reference}`);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Success', 'Payment completed, but registering transport booking on backend failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scroll>
      {truck?.imageUrl ? (
        <Image source={{ uri: truck.imageUrl }} style={styles.coverImage} />
      ) : null}
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
        {total > 0 && (
          <View style={{ marginVertical: spacing.sm, padding: spacing.sm, borderRadius: 8, backgroundColor: 'rgba(46, 125, 50, 0.08)' }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
              Estimated Distance: {estimatedDistance} km
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: colors.muted, fontWeight: '600', fontSize: 12 }}>Subtotal</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>GHS {total.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
              <Text style={{ color: colors.muted, fontWeight: '600', fontSize: 12 }}>Platform Fee (5%)</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>GHS {fee.toFixed(2)}</Text>
            </View>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 14, marginTop: 6, textAlign: 'right' }}>
              Estimated Cost: GHS {grandTotal.toFixed(2)}
            </Text>
          </View>
        )}
        <GlassButton
          title={isLoading ? 'Submitting...' : 'Request & Pay'}
          onPress={submit}
          loading={isLoading}
          disabled={isLoading || !pickup || !delivery || !date}
          style={{ marginTop: spacing.md }}
        />
      </GlassCard>

      <PaystackModal
        visible={paystackVisible}
        amount={grandTotal}
        email={`${(user?.phoneNumber ?? 'farmer').replace(/[^a-z0-9]/gi, '')}@harvestconnect.com`}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setPaystackVisible(false)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  coverImage: { width: '100%', height: 250, resizeMode: 'cover', borderRadius: 16, marginBottom: spacing.md },
  header: { marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text },
  subtitle: { marginTop: 6, color: colors.muted, fontWeight: '700' },
  meta: { marginTop: 6, color: colors.muted, fontWeight: '700' },
});

export default TransportRequestScreen;

