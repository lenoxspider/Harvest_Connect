// src/screens/farmer/IncomingOrdersScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { produceApi } from '../../api/produceApi';
import { ProduceOrder } from '../../types';

const IncomingOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<ProduceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await produceApi.getMyOrders();
      setOrders(data.filter(order => order.status === 'PENDING'));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleAccept = async (order: ProduceOrder) => {
    Alert.alert(
      'Accept Order',
      `Accept order for ${order.quantity_kg}kg?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              // await produceApi.acceptOrder(order.id);
              Alert.alert('Success', 'Order accepted!');
              fetchOrders();
            } catch (error) {
              Alert.alert('Error', 'Could not accept order');
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (order: ProduceOrder) => {
    Alert.alert(
      'Decline Order',
      `Decline order for ${order.quantity_kg}kg?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              // await produceApi.declineOrder(order.id);
              Alert.alert('Success', 'Order declined');
              fetchOrders();
            } catch (error) {
              Alert.alert('Error', 'Could not decline order');
            }
          },
        },
      ]
    );
  };

  const renderOrder = ({ item }: { item: ProduceOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>Order #{item.id}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.detailText}>Quantity: {item.quantity_kg}kg</Text>
        <Text style={styles.priceText}>Total: ${item.total_price}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAccept(item)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDecline(item)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No incoming orders</Text>
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
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666666',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    paddingTop: 12,
  },
  acceptButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  declineButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  declineButtonText: {
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

export default IncomingOrdersScreen;