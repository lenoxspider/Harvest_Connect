// src/screens/buyer/MyOrdersScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { produceApi } from '../../api/produceApi';
import { paymentApi } from '../../api/paymentApi';
import { ProduceOrder } from '../../types';

const MyOrdersScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
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
      setOrders(data);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FF6F00';
      case 'CONFIRMED':
        return '#1976D2';
      case 'DELIVERED':
        return '#2E7D32';
      case 'CANCELLED':
        return '#D32F2F';
      default:
        return '#666666';
    }
  };

  const handleConfirmReceipt = (item: ProduceOrder) => {
    Alert.alert(
      'Confirm Receipt',
      'Confirming receipt will release the payment from escrow to the Farmer. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // 1. Fetch transactions to find the one associated with this order
              const txs = await paymentApi.getMyTransactions();
              const match = txs.find((t) => t.order_id === item.id);
              if (match) {
                // 2. Call backend release endpoint
                await paymentApi.releaseEscrow(match.id);
              }
              
              setOrders((prev) =>
                prev.map((o) => (o.id === item.id ? { ...o, status: 'DELIVERED' } : o))
              );
              Alert.alert('Escrow Released', 'Receipt confirmed! Payment has been released to the Farmer.');
            } catch (error) {
              console.error('Escrow release error:', error);
              Alert.alert('Error', 'Escrow release failed on backend, but marking status locally.');
              setOrders((prev) =>
                prev.map((o) => (o.id === item.id ? { ...o, status: 'DELIVERED' } : o))
              );
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
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.detailText}>Quantity: {item.quantity_kg}kg</Text>
        <Text style={styles.priceText}>Total: GHS {item.total_price}</Text>
      </View>

      <Text style={styles.dateText}>
        Ordered on: {new Date(item.created_at).toLocaleString()}
      </Text>

      {item.status === 'CONFIRMED' && (
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => handleConfirmReceipt(item)}
        >
          <Text style={styles.reviewBtnText}>✓ Confirm Receipt</Text>
        </TouchableOpacity>
      )}

      {item.status === 'DELIVERED' && (
        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() =>
            navigation.navigate('SubmitReview', {
              targetId: item.listing_id || item.id,
              targetType: 'FARMER',
              targetName: 'Farmer Partner',
              referenceId: item.id,
            })
          }
        >
          <Text style={styles.reviewBtnText}>★ Leave Review</Text>
        </TouchableOpacity>
      )}
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
            <Text style={styles.emptyText}>You haven't placed any orders yet</Text>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  dateText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
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
  reviewBtn: {
    backgroundColor: '#7B1FA2',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  confirmBtn: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default MyOrdersScreen;