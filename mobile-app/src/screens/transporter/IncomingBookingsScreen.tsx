// src/screens/transporter/IncomingBookingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { transportApi } from '../../api/transportApi';
import { paymentApi } from '../../api/paymentApi';
import { TransportBooking } from '../../types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const TransporterBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [bookings, setBookings] = useState<TransportBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      if (!refreshing) setIsLoading(true);
      const data = await transportApi.getIncomingBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
  };

  const handleAccept = async (booking: TransportBooking) => {
    Alert.alert('Accept Booking', `Accept this transport request for $${booking.total_cost}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            await transportApi.acceptBooking(booking.id);
            Alert.alert('Success', 'Booking accepted!');
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', 'Could not accept booking');
          }
        },
      },
    ]);
  };

  const handleUpdateStatus = async (booking: TransportBooking, newStatus: TransportBooking['status'], title: string, msg: string) => {
    Alert.alert(title, msg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Proceed',
        onPress: async () => {
          try {
            await transportApi.updateStatus(booking.id, newStatus);
            
            // If the booking is completed, release the payment from escrow
            if (newStatus === 'COMPLETED') {
              try {
                const txs = await paymentApi.getMyTransactions();
                const match = txs.find((t) => t.order_id === booking.id);
                if (match) {
                  await paymentApi.releaseEscrow(match.id);
                }
              } catch (txError) {
                console.error('Failed to release escrow for transport:', txError);
              }
            }

            Alert.alert('Success', `Booking status updated to ${newStatus}!`);
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', 'Could not update booking status');
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
      case 'COMPLETED':
        return { bg: '#EEEEEE', text: '#757575' };
      default:
        return { bg: '#EEEEEE', text: '#757575' };
    }
  };

  const renderBooking = ({ item }: { item: TransportBooking }) => {
    const statusConfig = getStatusColor(item.status);

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookingTitle}>Booking #{item.id.substring(0, 8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.text }]}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.detail}>From: {item.pickup_location}</Text>
        <Text style={styles.detail}>To: {item.delivery_location}</Text>
        <Text style={styles.detail}>Date: {item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : 'Jul 5, 2026'}</Text>
        <Text style={styles.price}>Total: GHS {item.total_cost.toLocaleString()}</Text>

        {item.status === 'PENDING' && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E65100' }]} onPress={() => handleAccept(item)}>
            <Text style={styles.actionBtnText}>Accept Request</Text>
          </TouchableOpacity>
        )}

        {item.status === 'CONFIRMED' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]}
            onPress={() => handleUpdateStatus(item, 'COMPLETED', 'Complete Delivery', 'Confirm that the produce has been delivered successfully to release escrow payment?')}
          >
            <Text style={styles.actionBtnText}>Complete Delivery</Text>
          </TouchableOpacity>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E65100']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No incoming transport bookings found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF0E6',
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
  actionBtn: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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

export default TransporterBookingsScreen;
