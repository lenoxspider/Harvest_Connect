// src/screens/transporter/IncomingBookingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { transportApi } from '../../api/transportApi';
import { TransportBooking } from '../../types';

const TransporterBookingsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<TransportBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await transportApi.getIncomingBookings();
      setBookings(data.filter(b => b.status === 'PENDING'));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (booking: TransportBooking) => {
    Alert.alert('Accept Booking', `Accept this transport for $${booking.total_cost}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            // await transportApi.acceptBooking(booking.id);
            Alert.alert('Success', 'Booking accepted!');
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', 'Could not accept booking');
          }
        },
      },
    ]);
  };

  const renderBooking = ({ item }: { item: TransportBooking }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.bookingTitle}>Booking #{item.id}</Text>
      <Text style={styles.detail}>From: {item.pickup_location}</Text>
      <Text style={styles.detail}>To: {item.delivery_location}</Text>
      <Text style={styles.detail}>Date: {item.scheduled_date}</Text>
      <Text style={styles.price}>Total: ${item.total_cost}</Text>
      <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item)}>
        <Text style={styles.acceptButtonText}>Accept</Text>
      </TouchableOpacity>
    </View>
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
  acceptButton: {
    height: 40,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
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

export default TransporterBookingsScreen;