// src/screens/storage/MyFacilitiesScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { storageApi } from '../../api/storageApi';
import { StorageListing } from '../../types';

const MyFacilitiesScreen: React.FC = () => {
  const [facilities, setFacilities] = useState<StorageListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const data = await storageApi.getMyFacilities();
      setFacilities(data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFacility = ({ item }: { item: StorageListing }) => (
    <View style={styles.facilityCard}>
      <Text style={styles.name}>{item.facility_name}</Text>
      <View style={styles.details}>
        <Text style={styles.detail}>Capacity: {item.capacity_kg}kg</Text>
        <Text style={styles.price}>${item.price_per_kg_per_day}/kg/day</Text>
      </View>
      <Text style={styles.location}>📍 {item.location}</Text>
      <Text style={styles.features}>
        {item.has_cooling ? '❄️ Cooling Available' : '📦 Standard Storage'}
      </Text>
      <Text style={[styles.status, { color: item.status === 'AVAILABLE' ? '#2E7D32' : '#FF6F00' }]}>
        {item.status}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading facilities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={facilities}
        renderItem={renderFacility}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No storage facilities added yet</Text>
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
  facilityCard: {
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  details: {
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
    marginBottom: 4,
  },
  features: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
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

export default MyFacilitiesScreen;