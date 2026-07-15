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
import { paymentApi } from '../../api/paymentApi';
import { PaystackModal } from '../../ui/PaystackModal';
import { useAuth } from '../../context/AuthContext';

// Cart item now stores the listing ID + user-chosen quantity
interface CartEntry {
  id: string;
  quantity_kg: number;
}

const CART_KEY = 'cart_items_v2'; // new key so old bare-id arrays don't conflict
const MIN_QTY = 1;
const MAX_QTY = 10000;
const STEP = 10; // increment / decrement in 10 kg steps

export default function CartScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  // Enriched cart: listing details + chosen quantity
  const [cartItems, setCartItems] = useState<(BuyerListing & { quantity_kg: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paystackVisible, setPaystackVisible] = useState(false);

  // ─── Load cart from AsyncStorage ───────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(CART_KEY);
      const entries: CartEntry[] = raw ? JSON.parse(raw) : [];
      if (entries.length === 0) { setCartItems([]); return; }

      const allListings = await buyerApi.getListings();
      const matched = entries.flatMap(entry => {
        const listing = allListings.find(l => l.id === entry.id);
        return listing ? [{ ...listing, quantity_kg: entry.quantity_kg }] : [];
      });
      setCartItems(matched);
    } catch (e) {
      console.error('Error fetching cart:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchCart(); }, [fetchCart]));

  // ─── Persist updated entries back to AsyncStorage ──────────────────────────
  const persistCart = async (items: (BuyerListing & { quantity_kg: number })[]) => {
    const entries: CartEntry[] = items.map(i => ({ id: i.id, quantity_kg: i.quantity_kg }));
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(entries));
  };

  // ─── Quantity stepper ──────────────────────────────────────────────────────
  const adjustQty = async (itemId: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.id !== itemId) return item;
      const next = Math.min(MAX_QTY, Math.max(MIN_QTY, item.quantity_kg + delta));
      return { ...item, quantity_kg: next };
    });
    setCartItems(updated);
    await persistCart(updated);
  };

  // ─── Remove item ───────────────────────────────────────────────────────────
  const removeItem = async (itemId: string) => {
    const updated = cartItems.filter(i => i.id !== itemId);
    setCartItems(updated);
    await persistCart(updated);
  };

  const handleClearCart = async () => {
    await AsyncStorage.removeItem(CART_KEY);
    setCartItems([]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setPaystackVisible(true);
  };

  // ─── On Paystack success: place one order per cart item ───────────────────
  const handlePaymentSuccess = async (reference: string) => {
    setPaystackVisible(false);
    try {
      setIsLoading(true);
      for (const item of cartItems) {
        const order = await produceApi.placeOrder({
          listing_id: item.id,
          quantity_kg: item.quantity_kg,   // ← use actual quantity, not hardcoded 50
        });
        await paymentApi.initiatePayment({
          order_id: order.id,
          amount: item.pricePerBag * item.quantity_kg,
        });
      }
      await AsyncStorage.removeItem(CART_KEY);
      setCartItems([]);
      alert(`Checkout successful! Reference: ${reference}`);
      navigation.navigate('OrdersTab');
    } catch (e) {
      console.error('Error during checkout:', e);
      alert('Payment completed, but order placement failed on backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Total = sum of (pricePerBag × quantity) for each item
  const total = cartItems.reduce((sum, item) => sum + item.pricePerBag * item.quantity_kg, 0);
  const totalKg = cartItems.reduce((sum, item) => sum + item.quantity_kg, 0);

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
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                ) : (
                  <View style={[styles.image, { backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 20 }}>🌾</Text>
                  </View>
                )}

                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.region}>📍 {item.region}</Text>
                  <Text style={styles.unitPrice}>GHS {item.pricePerBag.toLocaleString()} / kg</Text>

                  {/* Quantity stepper */}
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => adjustQty(item.id, -STEP)}
                    >
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyLabel}>{item.quantity_kg} kg</Text>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => adjustQty(item.id, +STEP)}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeItem(item.id)}
                    >
                      <Text style={styles.removeBtnText}>🗑</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.lineTotal}>
                    Subtotal: GHS {(item.pricePerBag * item.quantity_kg).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {totalKg} kg
              </Text>
              <Text style={styles.totalValue}>GHS {total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>Checkout · GHS {total.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PaystackModal
        visible={paystackVisible}
        amount={total}
        email={`${user?.fullName?.replace(/\s+/g, '').toLowerCase() || 'buyer'}@harvestconnect.com`}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setPaystackVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3E5F5' },
  header: {
    backgroundColor: '#4A148C',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  clearText: { color: '#E1BEE7', fontWeight: 'bold', fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#7B1FA2', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  browseBtn: { backgroundColor: '#7B1FA2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  browseBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  scrollList: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 64, height: 64, borderRadius: 10, marginRight: 16, backgroundColor: '#E1BEE7' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 2 },
  region: { fontSize: 12, color: '#757575', marginBottom: 2 },
  unitPrice: { fontSize: 12, color: '#9E9E9E', marginBottom: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7B1FA2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
  qtyLabel: { fontSize: 14, fontWeight: 'bold', color: '#212121', minWidth: 56, textAlign: 'center' },
  removeBtn: { marginLeft: 'auto' as any, padding: 4 },
  removeBtnText: { fontSize: 16 },
  lineTotal: { fontSize: 13, fontWeight: 'bold', color: '#7B1FA2' },
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
  totalLabel: { fontSize: 13, color: '#757575', fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#7B1FA2' },
  checkoutBtn: {
    backgroundColor: '#7B1FA2',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
