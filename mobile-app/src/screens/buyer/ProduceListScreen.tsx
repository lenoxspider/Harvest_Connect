// src/screens/buyer/ProduceListScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { produceApi } from '../../api/produceApi';
import { ProduceListing } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

export default function ProduceListScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  // API States
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadListings = async (isRefreshed = false) => {
    if (isRefreshed) setRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await produceApi.getListings();
      setListings(data.filter((l) => l.status === 'AVAILABLE'));
      
      // Load favorites
      const favsRaw = await AsyncStorage.getItem('fav_listings');
      if (favsRaw) setFavorites(JSON.parse(favsRaw));
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [])
  );

  const toggleFavorite = async (id: string) => {
    try {
      let updated = [...favorites];
      if (updated.includes(id)) {
        updated = updated.filter((item) => item !== id);
      } else {
        updated.push(id);
      }
      setFavorites(updated);
      await AsyncStorage.setItem('fav_listings', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOrderNow = async (listing: ProduceListing) => {
    try {
      // Fetch existing cart items
      const cartRaw = await AsyncStorage.getItem('cart_items');
      const cartItems: string[] = cartRaw ? JSON.parse(cartRaw) : [];

      if (!cartItems.includes(listing.id)) {
        cartItems.push(listing.id);
        await AsyncStorage.setItem('cart_items', JSON.stringify(cartItems));
        Alert.alert('Cart Updated', `"${listing.title}" added to cart!`, [
          { text: 'Keep Browsing', style: 'cancel' },
          { text: 'Go to Cart', onPress: () => navigation.navigate('CartTab') },
        ]);
      } else {
        Alert.alert('Info', 'This item is already in your cart.', [
          { text: 'OK' },
          { text: 'Go to Cart', onPress: () => navigation.navigate('CartTab') },
        ]);
      }
    } catch (e) {
      console.error('Error adding to cart:', e);
    }
  };

  // Get unique categories for horizontal pills
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    list.add('All');
    listings.forEach((l) => {
      if (l.category) list.add(l.category);
    });
    return Array.from(list);
  }, [listings]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' ||
        l.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [listings, searchQuery, selectedCategory]);

  const renderCard = ({ item }: { item: ProduceListing }) => {
    const isFav = favorites.includes(item.id);
    const lowercaseTitle = item.title.toLowerCase();
    let emoji = '🌾';
    if (lowercaseTitle.includes('maize') || lowercaseTitle.includes('corn')) {
      emoji = '🌽';
    } else if (lowercaseTitle.includes('groundnut') || lowercaseTitle.includes('peanut')) {
      emoji = '🥜';
    } else if (lowercaseTitle.includes('plantain') || lowercaseTitle.includes('banana')) {
      emoji = '🍌';
    } else if (lowercaseTitle.includes('yam') || lowercaseTitle.includes('cassava') || lowercaseTitle.includes('potato')) {
      emoji = '🍠';
    }

    return (
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderEmoji}>{emoji}</Text>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.ratingText}>⭐ 0.0</Text>
          </View>

          <Text style={styles.locationText} numberOfLines={1}>
            📍 {item.location || 'Ashanti Region'}
          </Text>
          <Text style={styles.metaText}>Quantity available: {item.quantity_kg}</Text>
          <Text style={styles.priceText} numberOfLines={1}>
            GHS {item.price_per_kg} per bag
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.favBtn, isFav && styles.favBtnActive]}
              onPress={() => toggleFavorite(item.id)}
            >
              <Text style={[styles.favText, isFav && styles.favTextActive]}>
                {isFav ? '❤️' : '♡'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.orderBtn} onPress={() => handleOrderNow(item)}>
              <Text style={styles.orderBtnText}>Order Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A148C" />

      {/* HEADER SECTION */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Produce 🌽</Text>
        <TouchableOpacity style={styles.cartIconContainer} onPress={() => navigation.navigate('CartTab')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search produce..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* CATEGORIES PILLS */}
      <View style={styles.pillsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoriesList}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.pillsScroll}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.pill,
                  isActive ? styles.pillActive : styles.pillInactive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>
                  {item === 'All' ? 'Actives' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* LIST GRID */}
      <FlatList
        data={filteredListings}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listScroll}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadListings(true)} colors={['#4A148C']} />
        }
        ListEmptyComponent={
          <View style={styles.centerEmpty}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading produce...' : 'No produce listings available.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4A148C', // Deep purple
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  cartIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    color: '#9E9E9E',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
  },
  pillsContainer: {
    paddingVertical: 12,
  },
  pillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#4A148C',
  },
  pillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillTextInactive: {
    color: '#757575',
  },
  listScroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 110,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 44,
  },
  cardDetails: {
    padding: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 11,
    color: '#FFB300',
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 10,
    color: '#616161',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 4,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBtnActive: {
    borderColor: '#E81B23',
    backgroundColor: '#FFEBF0',
  },
  favText: {
    fontSize: 16,
    color: '#757575',
  },
  favTextActive: {
    color: '#E81B23',
  },
  orderBtn: {
    flex: 1,
    backgroundColor: '#4A148C',
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  centerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
});
