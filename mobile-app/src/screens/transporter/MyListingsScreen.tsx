// src/screens/transporter/MyListingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { transportApi } from '../../api/transportApi';
import { TruckListing } from '../../types';

const TransporterListingsScreen: React.FC = () => {
  const [trucks, setTrucks] = useState<TruckListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyTrucks();
  }, []);

  const fetchMyTrucks = async () => {
    try {
      setIsLoading(true);
      const data = await transportApi.getMyTrucks();
      setTrucks(data);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (truck: TruckListing) => {
    Alert.alert(
      'Delete Truck',
      `Remove ${truck.truck_type} from your fleet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // await transportApi.deleteTruck(truck.id);
              Alert.alert('Success', 'Truck removed');
              fetchMyTrucks();
            } catch (error) {
              Alert.alert('Error', 'Could not remove truck');
            }
          },
        },
      ]
    );
  };

  const renderTruck = ({ item }: { item: TruckListing }) => (
    <View style={styles.truckCard}>
      <View style={styles.truckHeader}>
        <Text style={styles.truckType}>{item.truck_type}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>

      <View style={styles.truckDetails}>
        <Text style={styles.detail}>Capacity: {item.capacity_kg}kg</Text>
        <Text style={styles.price}>${item.price_per_km}/km</Text>
      </View>

      <Text style={styles.location}>📍 {item.location}</Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.deleteButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your trucks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trucks}
        renderItem={renderTruck}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trucks added yet</Text>
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
  truckCard: {
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
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  truckType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  status: {
    fontSize: 12,
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  truckDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#666666',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  location: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  deleteButton: {
    height: 40,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
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

export default TransporterListingsScreen;