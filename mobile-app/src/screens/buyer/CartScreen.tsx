// src/screens/buyer/CartScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buyerApi, BuyerListing } from '../../api/buyerApi';
import { produceApi } from '../../api/produceApi';

export default function CartScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [cartItems, setCartItems] = useState<BuyerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const cartRaw = await AsyncStorage.getItem('cart_items');
      const itemIds: string[] = cartRaw ? JSON.parse(cartRaw) : [];
      if (itemIds.length === 0) {
        setCartItems([]);
        return;
      }

      // Fetch listings and filter to match cart item IDs
      const allListings = await buyerApi.getListings();
      const matched = allListings.filter((l) => itemIds.includes(l.id));
      setCartItems(matched);
    } catch (e) {
      console.error('Error fetching cart:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleClearCart = async () => {
    await AsyncStorage.removeItem('cart_items');
    setCartItems([]);
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      for (const item of cartItems) {
        await produceApi.placeOrder({
          listing_id: item.id,
          quantity_kg: 50, // default quantity per checkout item
        });
      }
      await AsyncStorage.removeItem('cart_items');
      setCartItems([]);
      alert('Order placed successfully!');
      navigation.navigate('OrdersTab');
    } catch (e) {
      console.error('Error checkout:', e);
      alert('Could not place order on backend');
    } finally {
      setIsLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.pricePerBag, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart 🛒</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7B1FA2" />
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Your cart is empty 🌽</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('BrowseTab')}
          >
            <Text style={styles.browseBtnText}>Browse Produce</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollList}>
            {cartItems.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.card}>
                <Image
                  source={{ uri: item.imageUrl ?? 'https://picsum.photos/100/100' }}
                  style={styles.image}
                />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.region}>📍 {item.region}</Text>
                  <Text style={styles.price}>GHS {item.pricePerBag}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>GHS {total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
  },
  header: {
    backgroundColor: '#4A148C',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#E1BEE7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#7B1FA2',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  browseBtn: {
    backgroundColor: '#7B1FA2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  scrollList: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: '#E1BEE7',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  region: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7B1FA2',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B1FA2',
  },
  checkoutBtn: {
    backgroundColor: '#7B1FA2',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
