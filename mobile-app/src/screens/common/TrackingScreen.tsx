import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { storageApi } from '../../api/storageApi';
import { transportApi } from '../../api/transportApi';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassButton } from '../../ui/GlassButton';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

type TrackingParams = {
  Tracking: { bookingId: string; type: 'storage' | 'transport' };
};

const roleAccent = (role?: string) => {
  switch (role) {
    case 'FARMER':
      return '#2E7D32';
    case 'STORAGE_OWNER':
      return '#1565C0';
    case 'TRANSPORTER':
      return '#E65100';
    default:
      return colors.accent;
  }
};

const Stepper: React.FC<{ steps: string[]; activeIndex: number; accent: string }> = ({
  steps,
  activeIndex,
  accent,
}) => {
  return (
    <View style={{ marginTop: spacing.md }}>
      {steps.map((label, idx) => {
        const done = idx < activeIndex;
        const active = idx === activeIndex;
        return (
          <View key={label} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                { backgroundColor: done || active ? accent : 'rgba(255,255,255,0.15)' },
              ]}
            />
            <View style={styles.stepLineWrap}>
              {idx < steps.length - 1 ? <View style={styles.stepLine} /> : null}
            </View>
            <Text style={[styles.stepText, active ? { color: colors.text } : null]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const TrackingScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<TrackingParams, 'Tracking'>>();
  const { bookingId, type } = route.params;
  const accent = roleAccent(user?.role);

  const [status, setStatus] = useState<string>('PENDING');
  const [meta, setMeta] = useState<Record<string, any> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const lastStatusRef = useRef<string>('');

  const steps = useMemo(() => {
    if (type === 'storage') return ['Pending', 'Confirmed', 'Active', 'Completed'];
    return ['Pending', 'Confirmed', 'Active', 'Completed'];
  }, [type]);

  const activeIndex = useMemo(() => {
    const s = (status ?? '').toUpperCase();
    if (s === 'PENDING') return 0;
    if (s === 'CONFIRMED') return 1;
    if (s === 'ACTIVE') return 2;
    if (s === 'COMPLETED') return 3;
    if (s === 'CANCELLED') return 0;
    return 0;
  }, [status]);

  const load = async () => {
    try {
      if (type === 'storage') {
        const b = await storageApi.getBookingById(bookingId);
        setStatus(String(b.status ?? 'PENDING'));
        setMeta(b as any);
      } else {
        const b = await transportApi.getBookingById(bookingId);
        setStatus(String(b.status ?? 'PENDING'));
        setMeta(b as any);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not load tracking data');
      navigation.goBack();
    }
  };

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 10_000);
    return () => clearInterval(id);
  }, [bookingId, type]);

  useEffect(() => {
    if (!lastStatusRef.current) {
      lastStatusRef.current = status;
      return;
    }
    if (lastStatusRef.current !== status) {
      lastStatusRef.current = status;
      Alert.alert('Status updated', `New status: ${status}`);
    }
  }, [status]);

  const onCall = async () => {
    const phone = '0500000000';
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      Alert.alert('Error', 'Could not open dialer');
    }
  };

  const onConfirmStorage = async () => {
    try {
      await storageApi.confirmBooking(bookingId);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.message || 'Confirm failed');
    }
  };

  const onUpdateTransportStatus = async (next: 'CONFIRMED' | 'ACTIVE' | 'COMPLETED') => {
    try {
      await transportApi.updateStatus(bookingId, next as any);
      setShowModal(false);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.message || 'Update failed');
    }
  };

  const mapRegion = useMemo(() => {
    return { latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  }, []);

  const [truckPos, setTruckPos] = useState({ latitude: 5.6037, longitude: -0.187 });
  useEffect(() => {
    if (type !== 'transport') return;
    const t = setInterval(() => {
      setTruckPos((p) => ({ latitude: p.latitude + 0.001, longitude: p.longitude + 0.001 }));
    }, 2000);
    return () => clearInterval(t);
  }, [type]);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Tracking</Text>
        <Text style={styles.subtitle}>
          {type === 'storage' ? 'Storage booking' : 'Transport job'} #{bookingId}
        </Text>
      </View>

      <GlassCard strength="strong" style={[styles.statusCard, { borderColor: accent }]}>
        <Text style={styles.statusLabel}>Current status</Text>
        <Text style={[styles.statusValue, { color: accent }]}>{status}</Text>
        <Stepper steps={steps} activeIndex={activeIndex} accent={accent} />
      </GlassCard>

      {type === 'transport' ? (
        <GlassCard style={{ marginTop: spacing.md, padding: 0, overflow: 'hidden' }} strength="strong">
          <MapView style={{ height: 240, width: '100%' }} initialRegion={mapRegion}>
            <Marker coordinate={truckPos} title="Truck" />
            <Marker coordinate={{ latitude: 5.61, longitude: -0.19 }} title="Start" pinColor={accent} />
            <Marker coordinate={{ latitude: 5.66, longitude: -0.14 }} title="Destination" pinColor={colors.danger} />
          </MapView>
        </GlassCard>
      ) : null}

      <View style={{ marginTop: spacing.md, gap: 12 }}>
        {user?.role === 'FARMER' ? (
          <GlassButton title="Call" onPress={onCall} />
        ) : null}

        {user?.role === 'STORAGE_OWNER' && type === 'storage' && String(status).toUpperCase() === 'PENDING' ? (
          <GlassButton title="Confirm Booking" onPress={onConfirmStorage} />
        ) : null}

        {user?.role === 'TRANSPORTER' && type === 'transport' ? (
          <GlassButton title="Update Status" onPress={() => setShowModal(true)} />
        ) : null}
      </View>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Update status</Text>
            <GlassButton title="Set CONFIRMED" onPress={() => onUpdateTransportStatus('CONFIRMED')} />
            <View style={{ height: 10 }} />
            <GlassButton title="Set ACTIVE" onPress={() => onUpdateTransportStatus('ACTIVE')} variant="secondary" />
            <View style={{ height: 10 }} />
            <GlassButton title="Set COMPLETED" onPress={() => onUpdateTransportStatus('COMPLETED')} variant="secondary" />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text },
  subtitle: { marginTop: 6, color: colors.muted, fontWeight: '700' },
  statusCard: { marginTop: spacing.sm, borderWidth: 1 },
  statusLabel: { color: colors.muted, fontWeight: '800' },
  statusValue: { marginTop: 8, fontWeight: '900', fontSize: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  stepDot: { width: 10, height: 10, borderRadius: 99, marginTop: 4 },
  stepLineWrap: { width: 18, alignItems: 'center' },
  stepLine: { width: 2, height: 26, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 6 },
  stepText: { flex: 1, color: colors.muted, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 18,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(10, 14, 26, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: { color: colors.text, fontWeight: '900', fontSize: 16, marginBottom: 12 },
});

export default TrackingScreen;

