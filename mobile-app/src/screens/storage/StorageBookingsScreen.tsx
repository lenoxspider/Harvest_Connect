// src/screens/storage/StorageBookingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { storageApi } from '../../api/storageApi';
import { StorageBooking } from '../../types';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const StorageBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [bookings, setBookings] = useState<StorageBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      if (!refreshing) setIsLoading(true);
      const data = await storageApi.getIncomingBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
  };

  const handleConfirm = async (booking: StorageBooking) => {
    Alert.alert('Confirm Booking', `Accept this storage booking?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await storageApi.confirmBooking(booking.id);
            Alert.alert('Success', 'Booking confirmed!');
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', 'Could not confirm booking');
          }
        },
      },
    ]);
  };

  const handleCancel = async (booking: StorageBooking) => {
    Alert.alert('Cancel Booking', `Cancel this storage booking?`, [
      { text: 'Back', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          try {
            await storageApi.cancelBooking(booking.id);
            Alert.alert('Cancelled', 'Booking cancelled.');
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', 'Could not cancel booking');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#FFE0B2', text: '#E65100' };
      case 'CONFIRMED':
        return { bg: '#E3F2FD', text: '#1565C0' };
      case 'ACTIVE':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'CANCELLED':
        return { bg: '#FFCDD2', text: '#C62828' };
      default:
        return { bg: '#EEEEEE', text: '#757575' };
    }
  };

  const renderBooking = ({ item }: { item: StorageBooking }) => {
    const statusConfig = getStatusColor(item.status);

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookingTitle}>Booking #{item.id.substring(0, 8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.text }]}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.detail}>Quantity: {item.quantity_tons} tons</Text>
        <Text style={styles.detail}>From: {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'Jul 5, 2026'}</Text>
        <Text style={styles.detail}>To: {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Jul 15, 2026'}</Text>
        <Text style={styles.price}>Total: GHS {item.total_price.toLocaleString()}</Text>
        
        {item.status === 'PENDING' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(item)}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1565C0']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No incoming storage bookings found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
    marginBottom: 12,
  },
  confirmButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#1565C0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default StorageBookingsScreen;
