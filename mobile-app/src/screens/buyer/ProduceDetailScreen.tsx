// src/screens/buyer/ProduceDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { produceApi } from '../../api/produceApi';
import { paymentApi } from '../../api/paymentApi';
import { ProduceListing, ProduceOrder } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';

type RouteParams = {
  ProduceDetail: {
    listingId: string;
  };
};

const ProduceDetailScreen: React.FC = () => {
  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const navigation = useNavigation();
  const route = useRoute<NativeStackScreenProps<RouteParams>['route']>();

  useEffect(() => {
    fetchListing();
  }, []);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const data = await produceApi.getListingById(route.params.listingId);
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Error', 'Could not load produce details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!listing || !quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (quantityNum > listing.quantity_kg) {
      Alert.alert('Error', `Only ${listing.quantity_kg}kg available`);
      return;
    }

    const totalPrice = (quantityNum * listing.price_per_kg).toFixed(2);
    
    Alert.alert(
      'Confirm Purchase',
      `Buy ${quantityNum}kg of ${listing.title} for $${totalPrice}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsOrdering(true);
            try {
              // Place order
              const order = await produceApi.placeOrder({
                listing_id: listing.id,
                quantity_kg: quantityNum,
              });

              // Initiate payment
              await paymentApi.initiatePayment({
                order_id: order.id,
                amount: parseFloat(totalPrice),
              });

              Alert.alert(
                'Success',
                'Order placed successfully! You will be notified when confirmed.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Order failed');
            } finally {
              setIsOrdering(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !listing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.category}>{listing.category}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Price per kg:</Text>
          <Text style={styles.value}>${listing.price_per_kg}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Available:</Text>
          <Text style={styles.value}>{listing.quantity_kg} kg</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{listing.location}</Text>
        </View>

        {listing.description && (
          <View style={styles.section}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>
        )}

        <View style={styles.orderSection}>
          <Text style={styles.orderTitle}>Order Details</Text>
          <View style={styles.quantityContainer}>
            <Text style={styles.label}>Quantity to buy (kg):</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
              editable={!isOrdering}
            />
          </View>

          {quantity && parseFloat(quantity) > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>
                ${(parseFloat(quantity) * listing.price_per_kg).toFixed(2)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (!quantity || parseFloat(quantity) <= 0 || isOrdering) && styles.buttonDisabled,
            ]}
            onPress={handleBuyNow}
            disabled={!quantity || parseFloat(quantity) <= 0 || isOrdering}
          >
            <Text style={styles.buttonText}>
              {isOrdering ? 'Processing...' : 'Buy Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#FF6F00',
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  section: {
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginTop: 8,
  },
  orderSection: {
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    marginTop: 24,
    paddingTop: 24,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  quantityContainer: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    marginTop: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  button: {
    height: 50,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProduceDetailScreen;