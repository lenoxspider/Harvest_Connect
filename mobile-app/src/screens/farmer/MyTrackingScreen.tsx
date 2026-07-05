// src/screens/farmer/MyTrackingScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageApi } from '../../api/storageApi';
import { transportApi } from '../../api/transportApi';
import { StorageBooking, TransportBooking } from '../../types';

type DateGroup = 'Today' | 'Yesterday' | 'This Week' | 'Older';

export default function MyTrackingScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  // Tab States
  const [activeTab, setActiveTab] = useState<'storage' | 'transport'>('storage');
  
  // Storage Bookings States
  const [storageBookings, setStorageBookings] = useState<any[]>([]);
  const [isStorageLoading, setIsStorageLoading] = useState(true);
  
  // Transport Bookings States
  const [transportBookings, setTransportBookings] = useState<any[]>([]);
  const [isTransportLoading, setIsTransportLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const loadStorageBookings = async () => {
    try {
      setIsStorageLoading(true);
      const data = await storageApi.getMyBookings();
      setStorageBookings(data);
    } catch (e) {
      console.error('Error fetching storage bookings:', e);
    } finally {
      setIsStorageLoading(false);
    }
  };

  const loadTransportBookings = async () => {
    try {
      setIsTransportLoading(true);
      const data = await transportApi.getMyBookings();
      setTransportBookings(data);
    } catch (e) {
      console.error('Error fetching transport bookings:', e);
    } finally {
      setIsTransportLoading(false);
    }
  };

  const loadAll = async (isRefreshed = false) => {
    if (isRefreshed) setRefreshing(true);
    await Promise.all([loadStorageBookings(), loadTransportBookings()]);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const handleContact = (phone?: string) => {
    const num = phone || '+233200000000';
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Error', 'Could not open phone dialer.');
    });
  };

  // Stepper Tracker Renderer
  const renderStepper = (status: string) => {
    const statuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'];
    // Handle aliases or lowercase
    const currentStatus = String(status).toUpperCase();
    const activeIndex = statuses.indexOf(currentStatus) >= 0 ? statuses.indexOf(currentStatus) : 0;

    return (
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRow}>
          {statuses.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            return (
              <React.Fragment key={step}>
                {/* Step circle */}
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted ? styles.stepCircleCompleted : styles.stepCirclePending,
                  ]}
                >
                  {isCompleted && <View style={styles.stepCircleInner} />}
                </View>
                {/* Connector line */}
                {idx < statuses.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      idx < activeIndex ? styles.connectorCompleted : styles.connectorPending,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
        <View style={styles.stepLabelsRow}>
          <Text style={styles.stepLabel}>Pending</Text>
          <Text style={styles.stepLabel}>Confirmed</Text>
          <Text style={styles.stepLabel}>Active</Text>
          <Text style={styles.stepLabel}>Completed</Text>
        </View>
      </View>
    );
  };

  const renderStorageCard = ({ item }: { item: any }) => {
    // Determine status color
    const status = String(item.status).toUpperCase();
    const isPending = status === 'PENDING';
    const badgeColor = isPending ? '#E65100' : status === 'CONFIRMED' ? '#1E5631' : '#1565C0';

    const startDateFormatted = item.start_date ? new Date(item.start_date).toLocaleDateString() : 'Dec 15, 2026';
    const endDateFormatted = item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Jan 15, 2027';

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.facilityName} numberOfLines={1}>
            {item.listing?.facility_name ?? item.facility_name ?? `Cold Storage Facility`}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.cardDetail}>📍 {item.listing?.location ?? item.location ?? 'Ejisu, Kumasi Road'}</Text>
        <Text style={styles.cardDetail}>📅 {startDateFormatted} → {endDateFormatted}</Text>
        <Text style={styles.cardDetail}>⚖️ {item.quantity_tons} tons</Text>
        <Text style={styles.priceValue}>GHS {item.total_price ? item.total_price.toLocaleString() : '3,500'}</Text>

        {renderStepper(status)}

        <TouchableOpacity style={styles.contactBtn} onPress={() => handleContact(item.listing?.ownerPhone)}>
          <Text style={styles.contactBtnText}>📞 Contact Owner</Text>
        </TouchableOpacity>

        {status === 'COMPLETED' && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() =>
              navigation.navigate('SubmitReview', {
                targetId: item.storage_id || 'storage-placeholder',
                targetType: 'STORAGE',
                targetName: item.listing?.facility_name ?? item.facility_name ?? 'Cold Storage Facility',
                referenceId: item.id,
              })
            }
          >
            <Text style={styles.reviewBtnText}>★ Leave Review</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTransportCard = ({ item }: { item: any }) => {
    const status = String(item.status).toUpperCase();
    const isPending = status === 'PENDING';
    const badgeColor = isPending ? '#E65100' : status === 'CONFIRMED' ? '#1E5631' : '#1565C0';

    const scheduledDateFormatted = item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : 'Dec 15, 2026';

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.facilityName} numberOfLines={1}>
            {item.truck?.truck_type ?? `Transport Trip`}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.cardDetail}>📍 Pickup: {item.pickup_location}</Text>
        <Text style={styles.cardDetail}>📍 Delivery: {item.delivery_location}</Text>
        <Text style={styles.cardDetail}>📅 Scheduled: {scheduledDateFormatted}</Text>
        <Text style={styles.priceValue}>GHS {item.total_cost ? item.total_cost.toLocaleString() : '1,200'}</Text>

        {renderStepper(status)}

        <TouchableOpacity style={styles.contactBtn} onPress={() => handleContact(item.truck?.transporterPhone)}>
          <Text style={styles.contactBtnText}>📞 Contact Driver</Text>
        </TouchableOpacity>

        {status === 'COMPLETED' && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() =>
              navigation.navigate('SubmitReview', {
                targetId: item.truck_id || 'transport-placeholder',
                targetType: 'TRANSPORTER',
                targetName: item.truck?.truck_type ?? 'Transporter Vehicle',
                referenceId: item.id,
              })
            }
          >
            <Text style={styles.reviewBtnText}>★ Leave Review</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const isLoading = activeTab === 'storage' ? isStorageLoading : isTransportLoading;
  const currentData = activeTab === 'storage' ? storageBookings : transportBookings;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5631" />

      {/* CURVED HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tracking 📍</Text>
        <Text style={styles.headerSubtitle}>Monitor your bookings in real time</Text>
      </View>

      {/* SEGMENTED TABS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'storage' && styles.tabActive]}
          onPress={() => setActiveTab('storage')}
        >
          <Text style={[styles.tabText, activeTab === 'storage' && styles.tabTextActive]}>
            🏭 Storage Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transport' && styles.tabActive]}
          onPress={() => setActiveTab('transport')}
        >
          <Text style={[styles.tabText, activeTab === 'transport' && styles.tabTextActive]}>
            🚚 Transport Trips
          </Text>
        </TouchableOpacity>
      </View>

      {/* STATISTICS ROW */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>
            {activeTab === 'storage' ? storageBookings.length : transportBookings.length}
          </Text>
          <Text style={styles.statLbl}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>
            {activeTab === 'storage'
              ? storageBookings.filter((b) => b.status === 'PENDING').length
              : transportBookings.filter((b) => b.status === 'PENDING').length}
          </Text>
          <Text style={styles.statLbl}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>
            {activeTab === 'storage'
              ? storageBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE').length
              : transportBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE').length}
          </Text>
          <Text style={styles.statLbl}>Active</Text>
        </View>
      </View>

      {/* LIST CONTENT */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1E5631" />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} colors={['#1E5631']} />
          }
          renderItem={activeTab === 'storage' ? renderStorageCard : renderTransportCard}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No bookings trackable at the moment.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F4',
  },
  header: {
    backgroundColor: '#1E5631', // Deep green
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: -10,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 24,
    height: 44,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1E5631',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    opacity: 0.75,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  statLbl: {
    fontSize: 10,
    color: '#757575',
    fontWeight: '600',
    marginTop: 2,
  },
  listScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDetail: {
    fontSize: 12,
    color: '#616161',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E5631',
    marginTop: 6,
    marginBottom: 14,
  },
  stepperContainer: {
    marginVertical: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCirclePending: {
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
  },
  stepCircleCompleted: {
    borderColor: '#1E5631',
    backgroundColor: '#FFFFFF',
  },
  stepCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E5631',
  },
  connectorLine: {
    flex: 1,
    height: 2,
  },
  connectorPending: {
    backgroundColor: '#CCCCCC',
  },
  connectorCompleted: {
    backgroundColor: '#1E5631',
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 9,
    color: '#757575',
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  contactBtn: {
    borderWidth: 1,
    borderColor: '#1E5631',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  contactBtnText: {
    color: '#1E5631',
    fontWeight: 'bold',
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  reviewBtn: {
    backgroundColor: '#1E5631',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
