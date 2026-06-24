// src/screens/storage/StorageBookingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { storageApi } from '../../api/storageApi';
import { StorageBooking } from '../../types';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const StorageBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [bookings, setBookings] = useState<StorageBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await storageApi.getIncomingBookings();
      setBookings(data.filter(b => b.status === 'PENDING'));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
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

  const renderBooking = ({ item }: { item: StorageBooking }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Tracking', { bookingId: item.id, type: 'storage' })}>
      <View style={styles.bookingCard}>
        <Text style={styles.bookingTitle}>Booking #{item.id}</Text>
        <Text style={styles.detail}>Quantity: {item.quantity_tons} tons</Text>
        <Text style={styles.detail}>From: {item.start_date}</Text>
        <Text style={styles.detail}>To: {item.end_date}</Text>
        <Text style={styles.price}>Total: GHS {item.total_price}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(item)}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No incoming bookings</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
    marginBottom: 12,
  },
  confirmButton: {
    height: 40,
    backgroundColor: '#2E7D32',
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
  },
  cancelButton: {
    height: 40,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default StorageBookingsScreen;
