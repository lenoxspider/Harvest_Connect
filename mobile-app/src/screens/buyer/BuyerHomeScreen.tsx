// src/screens/buyer/BuyerHomeScreen.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { buyerApi, BuyerStats, FarmerProfile, BuyerOrder, BuyerListing } from '../../api/buyerApi';
import { useHomepageSettings } from '../../hooks/useHomepageSettings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

const QUICK_ACTIONS = [
  { id: 'browse', label: 'Browse Produce', emoji: '🌽', screen: 'BrowseTab' },
  { id: 'notifications', label: 'Notifications', emoji: '🔔', screen: 'Notifications' },
  { id: 'track', label: 'Track Order', emoji: '📍', screen: 'Tracking' },
  { id: 'orders', label: 'My Orders', emoji: '🧾', screen: 'OrdersTab' },
  { id: 'saved', label: 'Saved', emoji: '⭐', screen: 'Saved' },
];

const BuyerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // UI States
  const [userName, setUserName] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Data States
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [featuredProduce, setFeaturedProduce] = useState<BuyerListing[]>([]);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [recentOrders, setRecentOrders] = useState<BuyerOrder[]>([]);

  // Hero banner state
  const { settings: hpSettings } = useHomepageSettings();
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);
  const heroBannerRef = useRef<any>(null);

  // Loading States
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isProduceLoading, setIsProduceLoading] = useState(true);
  const [isFarmersLoading, setIsFarmersLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Error/Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const loadInitialData = async (isRefreshed = false) => {
    if (isRefreshed) setRefreshing(true);
    else {
      setIsStatsLoading(true);
      setIsProduceLoading(true);
      setIsFarmersLoading(true);
      setIsOrdersLoading(true);
    }

    // Load user profile & notification badge first
    try {
      const me = await buyerApi.getMe();
      setUserName(me?.fullName ?? 'Buyer');
    } catch (e) {
      setUserName('Buyer');
    }

    try {
      const uCount = await buyerApi.getUnreadNotificationsCount();
      setUnreadCount(uCount);
    } catch {
      setUnreadCount(0);
    }

    // Fetch Stats
    try {
      const statsData = await buyerApi.getOrderStats();
      setStats(statsData);
    } catch (e) {
      setStats(null);
      displayToast('Failed to load data. Pull to refresh.');
    } finally {
      setIsStatsLoading(false);
    }

    // Fetch Categories
    try {
      const cats = await buyerApi.getCategories();
      setCategories(cats);
    } catch {
      setCategories([]);
    }

    // Fetch Featured Produce
    try {
      const produce = await buyerApi.getListings({ featured: true, limit: 6 });
      setFeaturedProduce(produce);
    } catch (e) {
      setFeaturedProduce([]);
      displayToast('Failed to load data. Pull to refresh.');
    } finally {
      setIsProduceLoading(false);
    }

    // Fetch Farmers
    try {
      const farmerList = await buyerApi.getFarmers({ limit: 5 });
      setFarmers(farmerList);
    } catch (e) {
      setFarmers([]);
    } finally {
      setIsFarmersLoading(false);
    }

    // Fetch Recent Orders
    try {
      const orders = await buyerApi.getRecentOrders({ limit: 5 });
      setRecentOrders(orders);
    } catch (e) {
      setRecentOrders([]);
    } finally {
      setIsOrdersLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-scroll hero banner
  useEffect(() => {
    const heroImages = [
      hpSettings.heroImage1,
      hpSettings.heroImage2,
      hpSettings.heroImage3,
      hpSettings.heroImage4,
    ].filter(Boolean);
    if (heroImages.length < 2) return;
    const timer = setInterval(() => {
      setHeroBannerIndex(prev => {
        const next = (prev + 1) % heroImages.length;
        heroBannerRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [hpSettings]);

  useFocusEffect(
    useCallback(() => {
      // Refresh badge counts on screen focus
      const refreshBadges = async () => {
        try {
          const uCount = await buyerApi.getUnreadNotificationsCount();
          setUnreadCount(uCount);
        } catch {}
      };
      refreshBadges();
    }, [])
  );

  const onRefresh = () => {
    loadInitialData(true);
  };

  const handleSearchSubmit = async () => {
    setIsProduceLoading(true);
    try {
      const results = await buyerApi.getListings({ search: searchQuery });
      setFeaturedProduce(results);
    } catch (e) {
      displayToast('Failed to load search results.');
    } finally {
      setIsProduceLoading(false);
    }
  };

  const handleCategoryPress = async (cat: string) => {
    setActiveCategory(cat);
    setIsProduceLoading(true);
    try {
      const results = await buyerApi.getListings({
        category: cat === 'All' ? undefined : cat,
        featured: cat === 'All' ? true : undefined,
        limit: 6,
      });
      setFeaturedProduce(results);
    } catch (e) {
      displayToast(`Failed to load ${cat} listings.`);
    } finally {
      setIsProduceLoading(false);
    }
  };

  const handleAddToCart = async (listingId: string) => {
    try {
      await buyerApi.addToCart(listingId);
      displayToast('Successfully added item to cart!');
    } catch (e) {
      displayToast('Failed to add item to cart.');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#FFE0B2', text: '#E65100' };
      case 'CONFIRMED':
        return { bg: '#E1BEE7', text: '#7B1FA2' };
      case 'DELIVERED':
        return { bg: '#C8E6C9', text: '#1B5E20' };
      case 'CANCELLED':
        return { bg: '#FFCDD2', text: '#B71C1C' };
      default:
        return { bg: '#EEEEEE', text: '#757575' };
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.id === 'saved') {
      displayToast('Saved listings coming soon!');
    } else {
      navigation.navigate(action.screen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A148C" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.welcomeText}>
            Welcome, <Text style={styles.userName}>{userName}</Text> 🛒
          </Text>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search produce or farmers..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* HERO BANNER — only shown when backend provides at least one image URL */}
      {(() => {
        const heroImages = [
          hpSettings.heroImage1,
          hpSettings.heroImage2,
          hpSettings.heroImage3,
          hpSettings.heroImage4,
        ].filter(Boolean);
        if (heroImages.length === 0) return null;
        return (
          <View style={styles.heroBannerContainer}>
            <ScrollView
              ref={heroBannerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={e => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setHeroBannerIndex(idx);
              }}
            >
              {heroImages.map((uri, idx) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={styles.heroBannerImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {/* Dot indicators */}
            {heroImages.length > 1 && (
              <View style={styles.heroDots}>
                {heroImages.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.heroDot,
                      i === heroBannerIndex && styles.heroDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })()}

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7B1FA2']} />
        }
      >
        {/* STATS SECTION */}
        <View style={styles.statsRow}>
          {isStatsLoading ? (
            // Skeleton Loader
            [1, 2, 3].map((i) => (
              <View key={i} style={[styles.statCard, styles.skeletonCard]}>
                <ActivityIndicator size="small" color="#7B1FA2" />
              </View>
            ))
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats ? stats.activeOrders : '—'}</Text>
                <Text style={styles.statLabel}>Active Orders</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats ? stats.delivered : '—'}</Text>
                <Text style={styles.statLabel}>Delivered</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {stats ? `GHS ${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
            </>
          )}
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsScroll}
        >
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionItem}
              onPress={() => handleQuickAction(action)}
              activeOpacity={0.8}
            >
              <View style={styles.actionEmojiWrapper}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
              </View>
              <Text style={styles.actionLabel} numberOfLines={2}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CATEGORY FILTER TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {['All', ...categories].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isActive ? styles.categoryPillActive : styles.categoryPillInactive,
                ]}
                onPress={() => handleCategoryPress(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive ? styles.categoryTextActive : styles.categoryTextInactive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FEATURED PRODUCE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Produce</Text>
        </View>

        {isProduceLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#7B1FA2" />
          </View>
        ) : featuredProduce.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No listings found</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {featuredProduce.map((item) => (
              <View key={item.id} style={styles.produceCard}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.produceImage}
                  />
                ) : (
                  <View style={[styles.produceImage, { backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 40 }}>🌾</Text>
                  </View>
                )}
                <View style={styles.produceDetails}>
                  <Text style={styles.produceName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.produceRegion} numberOfLines={1}>
                    📍 {item.region}
                  </Text>
                  <Text style={styles.produceRating}>⭐ {item.rating.toFixed(1)}</Text>
                  <Text style={styles.producePrice}>GHS {item.pricePerBag}/bag</Text>
                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => handleAddToCart(item.id)}
                  >
                    <Text style={styles.addToCartBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* NEARBY FARMERS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Farmers</Text>
        </View>

        {isFarmersLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color="#7B1FA2" />
          </View>
        ) : farmers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No nearby farmers found</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.farmersScroll}
          >
            {farmers.map((farmer) => (
              <View key={farmer.id} style={styles.farmerCard}>
                {farmer.avatarUrl ? (
                  <Image
                    source={{ uri: farmer.avatarUrl }}
                    style={styles.farmerAvatar}
                  />
                ) : (
                  <View style={[styles.farmerAvatar, { backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#E65100' }}>
                      {farmer.fullName.charAt(0)}
                    </Text>
                  </View>
                )}
                <Text style={styles.farmerName} numberOfLines={1}>
                  {farmer.fullName}
                </Text>
                <Text style={styles.farmerRegion} numberOfLines={1}>
                  📍 {farmer.region}
                </Text>
                <Text style={styles.farmerRating}>⭐ {farmer.rating.toFixed(1)}</Text>
                <TouchableOpacity
                  style={styles.viewListingsBtn}
                  onPress={() => navigation.navigate('BrowseTab', { screen: 'ProduceList', params: { farmerId: farmer.id } })}
                >
                  <Text style={styles.viewListingsBtnText}>View Listings</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* RECENT ORDERS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OrdersTab')}>
            <Text style={styles.seeAllLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {isOrdersLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color="#7B1FA2" />
          </View>
        ) : recentOrders.length === 0 ? (
          <View style={[styles.emptyContainer, { marginBottom: 30 }]}>
            <Text style={styles.emptyText}>No recent orders</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {recentOrders.map((order) => {
              const statusStyle = getStatusBadgeColor(order.status);
              return (
                <View key={order.id} style={styles.orderCard}>
                  {order.produceImage ? (
                    <Image
                      source={{ uri: order.produceImage }}
                      style={styles.orderImage}
                    />
                  ) : (
                    <View style={[styles.orderImage, { backgroundColor: '#E1F5FE', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 20 }}>📦</Text>
                    </View>
                  )}
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderName}>{order.produceName}</Text>
                    <Text style={styles.orderQty}>Quantity: {order.quantity}</Text>
                    <Text style={styles.orderDate}>{order.createdAt}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* SNACKBAR / TOAST */}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
  },
  header: {
    backgroundColor: '#4A148C',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E74C3C',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#9E9E9E',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -16,
    marginBottom: 24,
  },
  heroBannerContainer: {
    width: SCREEN_WIDTH,
    height: 180,
    marginBottom: 12,
    position: 'relative',
  },
  heroBannerImage: {
    width: SCREEN_WIDTH,
    height: 180,
  },
  heroDots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  heroDotActive: {
    backgroundColor: '#FFFFFF',
    width: 18,
  },
  statCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  skeletonCard: {
    justifyContent: 'center',
    height: 75,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A148C',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  seeAllLink: {
    color: '#7B1FA2',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  actionItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 65,
  },
  actionEmojiWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    marginVertical: 18,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#7B1FA2',
    borderColor: '#7B1FA2',
  },
  categoryPillInactive: {
    backgroundColor: 'transparent',
    borderColor: '#D1C4E9',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryTextInactive: {
    color: '#7B1FA2',
  },
  centerLoading: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  produceCard: {
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
  produceImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E1BEE7',
  },
  produceDetails: {
    padding: 12,
  },
  produceName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  produceRegion: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  produceRating: {
    fontSize: 12,
    color: '#FFB300',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  producePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginBottom: 10,
  },
  addToCartBtn: {
    backgroundColor: '#7B1FA2',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  farmersScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
    marginBottom: 20,
  },
  farmerCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  farmerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: '#E1BEE7',
  },
  farmerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 2,
  },
  farmerRegion: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 2,
  },
  farmerRating: {
    fontSize: 11,
    color: '#FFB300',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  viewListingsBtn: {
    borderColor: '#7B1FA2',
    borderWidth: 1,
    borderRadius: 8,
    height: 28,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewListingsBtnText: {
    color: '#7B1FA2',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ordersList: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#E1BEE7',
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  orderQty: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#323232',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default BuyerHomeScreen;
