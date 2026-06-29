import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
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

interface StepperProps {
  steps: string[];
  activeIndex: number;
  accent: string;
}

const Stepper: React.FC<StepperProps> = ({ steps, activeIndex, accent }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={{ marginTop: spacing.md, paddingHorizontal: spacing.sm }}>
      {steps.map((label, idx) => {
        const isCompleted = idx < activeIndex;
        const isActive = idx === activeIndex;
        const isPending = idx > activeIndex;

        return (
          <View key={label} style={styles.stepRow}>
            <View style={styles.indicatorContainer}>
              {isCompleted && (
                <View style={[styles.stepDot, styles.dotCompleted, { backgroundColor: accent }]} />
              )}
              {isActive && (
                <View style={styles.activeDotOuter}>
                  <Animated.View
                    style={[
                      styles.dotPulse,
                      {
                        transform: [{ scale: pulseAnim }],
                        backgroundColor: accent,
                      },
                    ]}
                  />
                  <View style={[styles.stepDot, styles.dotCompleted, { backgroundColor: accent, width: 8, height: 8 }]} />
                </View>
              )}
              {isPending && (
                <View style={styles.dotPending} />
              )}
              {idx < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: isCompleted ? accent : 'rgba(255,255,255,0.15)' },
                  ]}
                />
              )}
            </View>
            <View style={styles.stepTextContainer}>
              <Text
                style={[
                  styles.stepText,
                  isActive && { color: colors.text, fontWeight: '800' },
                  isCompleted && { color: 'rgba(255,255,255,0.85)' },
                ]}
              >
                {label}
              </Text>
            </View>
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lastStatusRef = useRef<string>('');

  const steps = useMemo(() => {
    if (type === 'storage') {
      return [
        'Booking Received 🕐',
        'Confirmed by Owner ✅',
        'Storage Active 🏭',
        'Completed 🎉'
      ];
    }
    return [
      'Job Accepted 🚛',
      'Driver En Route to Pickup 📍',
      'Produce Picked Up 📦',
      'Delivered ✅'
    ];
  }, [type]);

  const activeIndex = useMemo(() => {
    const s = (status ?? '').toUpperCase();
    if (type === 'storage') {
      if (s === 'PENDING') return 0;
      if (s === 'CONFIRMED') return 1;
      if (s === 'ACTIVE') return 2;
      if (s === 'COMPLETED') return 3;
    } else {
      if (s === 'PENDING') return 0;
      if (s === 'CONFIRMED') return 1; // Job Accepted
      if (s === 'ACTIVE') return 2;    // En route / picked up
      if (s === 'COMPLETED') return 3; // Delivered
    }
    return 0;
  }, [status, type]);

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
      setToastMessage(`Status updated: ${status} ✅`);
      const t = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  useEffect(() => {
    (async () => {
      if (type === 'transport') {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          console.log('Location permission was denied');
        }
      }
    })();
  }, [type]);

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
      setTruckPos((p) => ({ latitude: p.latitude + 0.0005, longitude: p.longitude + 0.0005 }));
    }, 2000);
    return () => clearInterval(t);
  }, [type]);

  const contactButtonLabel = useMemo(() => {
    if (type === 'storage') return 'Contact Storage Owner';
    return 'Contact Driver';
  }, [type]);

  return (
    <Screen scroll>
      <View style={styles.container}>
        {toastMessage && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.headerContainer}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backArrowText, { color: accent }]}>←</Text>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Track My Order</Text>
            <Text style={styles.headerSubtitle}>
              {type === 'storage' ? 'Storage Booking' : 'Transport Request'} #{bookingId}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Vertical Stepper Status Card */}
        <GlassCard strength="strong" style={[styles.statusCard, { borderColor: accent }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: accent + '20', borderColor: accent }]}>
              <Text style={[styles.statusBadgeText, { color: accent }]}>{status}</Text>
            </View>
          </View>
          <Stepper steps={steps} activeIndex={activeIndex} accent={accent} />
        </GlassCard>

        {/* Live Map View (Transport only) */}
        {type === 'transport' && (
          <GlassCard style={styles.mapCard} strength="strong">
            <View style={styles.mapWrapper}>
              <MapView style={styles.map} initialRegion={mapRegion}>
                <Marker coordinate={truckPos} title="Truck" description="Current truck location" />
                <Marker coordinate={{ latitude: 5.61, longitude: -0.19 }} title="Pickup" pinColor={accent} />
                <Marker coordinate={{ latitude: 5.66, longitude: -0.14 }} title="Destination" pinColor={colors.danger} />
              </MapView>
              <View style={styles.etaOverlay}>
                <Text style={styles.etaText}>Estimated Arrival: 35 mins</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Booking Details Card */}
        <GlassCard style={styles.detailsCard} strength="normal">
          <Text style={styles.detailsTitle}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{type === 'storage' ? 'Facility Name' : 'Driver / Truck'}</Text>
            <Text style={styles.detailValue}>
              {type === 'storage' ? (meta?.facility_name || 'Storage Owner') : 'Express Delivery'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Locations</Text>
            <Text style={styles.detailValue}>
              {type === 'storage'
                ? (meta?.location || 'Storage Facility')
                : `${meta?.pickup_location || 'Accra'} → ${meta?.delivery_location || 'Kumasi'}`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>
              {type === 'storage' 
                ? `${meta?.quantity_tons || 0} Tons` 
                : `${meta?.quantity_tons || meta?.quantityTons || 'Standard load'}`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{type === 'storage' ? 'Booking Period' : 'Date'}</Text>
            <Text style={styles.detailValue}>
              {type === 'storage'
                ? `${meta?.start_date?.split('T')[0] || 'Start'} - ${meta?.end_date?.split('T')[0] || 'End'}`
                : (meta?.scheduled_date?.split('T')[0] || 'Scheduled Date')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Price</Text>
            <Text style={styles.priceValue}>
              {type === 'storage' 
                ? `${meta?.total_price || 0} GHS` 
                : `${meta?.total_cost || 0} GHS`}
            </Text>
          </View>
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {user?.role === 'FARMER' && (
            <GlassButton title={contactButtonLabel} onPress={onCall} />
          )}

          {user?.role === 'STORAGE_OWNER' && type === 'storage' && String(status).toUpperCase() === 'PENDING' && (
            <GlassButton title="Confirm Booking" onPress={onConfirmStorage} />
          )}

          {user?.role === 'TRANSPORTER' && type === 'transport' && (
            <GlassButton title="Update Status" onPress={() => setShowModal(true)} />
          )}
        </View>
      </View>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <GlassButton title="Accept Job (Set CONFIRMED)" onPress={() => onUpdateTransportStatus('CONFIRMED')} />
            <View style={{ height: 10 }} />
            <GlassButton title="Start Trip (Set ACTIVE)" onPress={() => onUpdateTransportStatus('ACTIVE')} variant="secondary" />
            <View style={{ height: 10 }} />
            <GlassButton title="Complete Delivery (Set COMPLETED)" onPress={() => onUpdateTransportStatus('COMPLETED')} variant="secondary" />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  toastContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: '#2E7D32',
    padding: spacing.sm + 4,
    borderRadius: 8,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
  },
  backButton: {
    padding: spacing.xs,
    width: 44,
  },
  backArrowText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '900',
  },
  headerSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  statusCard: {
    marginTop: spacing.sm,
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusLabel: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 14,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  // Stepper styles
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },
  indicatorContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  dotCompleted: {},
  activeDotOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  dotPulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.4,
  },
  dotPending: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#7F8C8D',
    backgroundColor: 'transparent',
    marginTop: 6,
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    bottom: -16,
    width: 2,
    zIndex: -1,
  },
  stepTextContainer: {
    flex: 1,
    paddingLeft: spacing.sm,
    paddingTop: 2,
  },
  stepText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  // Map View styles
  mapCard: {
    marginTop: spacing.md,
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapWrapper: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  etaOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  etaText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  // Details Card styles
  detailsCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  detailsTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  detailLabel: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 13,
  },
  detailValue: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
    maxWidth: '60%',
    textAlign: 'right',
  },
  priceValue: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  actionContainer: {
    marginTop: spacing.md,
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: spacing.md,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: 'rgba(10, 14, 26, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});

export default TrackingScreen;


