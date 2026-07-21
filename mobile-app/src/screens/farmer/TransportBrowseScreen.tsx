// src/screens/farmer/TransportBrowseScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { transportApi } from '../../api/transportApi';
import { TruckListing } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

export default function TransportBrowseScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  // API States
  const [trucks, setTrucks] = useState<TruckListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showError, setShowError] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [maxLoadFilter, setMaxLoadFilter] = useState(25); // max load slider representation
  const [locationFilter, setLocationFilter] = useState('');

  const loadTrucks = async (isRefreshed = false) => {
    if (isRefreshed) setRefreshing(true);
    else setIsLoading(true);
    setShowError(false);

    try {
      const data = await transportApi.getTrucks();
      setTrucks(data);
    } catch (error) {
      console.error('Error fetching trucks:', error);
      setShowError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrucks();
    }, [])
  );

  const handleBookNow = (truck: TruckListing) => {
    navigation.navigate('TransportRequest', { truck });
  };

  // Filter Logic
  const filteredTrucks = trucks.filter((truck) => {
    // 1. Search filter
    const matchesSearch =
      searchQuery.trim() === '' ||
      truck.truck_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.location.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Vehicle type filter
    const matchesType =
      selectedType === 'All' ||
      truck.truck_type.toLowerCase().includes(selectedType.toLowerCase());

    // 3. Location filter
    const matchesLocation =
      locationFilter.trim() === '' ||
      truck.location.toLowerCase().includes(locationFilter.toLowerCase());

    // 4. Max load filter
    const maxTons = truck.capacity_kg / 1000;
    const matchesLoad = maxTons <= maxLoadFilter;

    return matchesSearch && matchesType && matchesLocation && matchesLoad;
  });

  const handleResetFilters = () => {
    setSelectedType('All');
    setMaxLoadFilter(25);
    setLocationFilter('');
    setIsFilterVisible(false);
  };

  const handleApplyFilters = () => {
    setIsFilterVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity style={styles.headerIconContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transport</Text>
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={() => setIsFilterVisible(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchBarIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location or vehicle type..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BODY TITLE */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Vehicles</Text>
        <Text style={styles.sectionSubtitle}>
          {filteredTrucks.length} vehicles found
        </Text>
      </View>

      {/* VEHICLES GRID */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D84315" />
        </View>
      ) : filteredTrucks.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.noVehiclesCard}>
            <Text style={styles.noVehiclesText}>No vehicles available</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadTrucks(true)} colors={['#D84315']} />
          }
        >
          <View style={styles.gridContainer}>
            {filteredTrucks.map((truck) => {
              const maxLoadTons = (truck.capacity_kg / 1000).toFixed(1);
              const fallbackImage = 'https://picsum.photos/400/300';
              // Format plate from dynamic ID
              const plateNumber = `GR-${truck.id.substring(0, 4).toUpperCase()}-26`;

              return (
                <View key={truck.id} style={styles.vehicleCard}>
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: fallbackImage }} style={styles.vehicleImage} />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Available ✓</Text>
                    </View>
                  </View>

                  <View style={styles.cardDetails}>
                    <Text style={styles.truckType} numberOfLines={1}>
                      {truck.truck_type}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      📍 {truck.location || 'Location Placeholder'}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      🚚 {plateNumber} · ⚖️ Max: {maxLoadTons} tons
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      🗺️ Route: {truck.location ? `${truck.location} → Accra` : 'Ghana'}
                    </Text>
                    <Text style={styles.ratingText}>
                      ⭐ 0.0 · 0 trips
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.priceLabel}>GHS</Text>
                        <Text style={styles.priceValue} numberOfLines={1}>
                          {truck.price_per_km}/km
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => handleBookNow(truck)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.bookBtnText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* ERROR SNACKBAR */}
      {showError && (
        <View style={styles.errorSnackbar}>
          <Text style={styles.errorText}>Failed to load vehicles. Pull to refresh.</Text>
        </View>
      )}

      {/* FILTER MODAL */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Vehicles</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Vehicle Type selection */}
              <Text style={styles.filterSectionTitle}>Vehicle Type</Text>
              <View style={styles.filterTabs}>
                {['All', 'Truck', 'Pickup', 'Van', 'Refrigerated'].map((type) => {
                  const isActive = selectedType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterTab,
                        isActive ? styles.filterTabActive : styles.filterTabInactive,
                      ]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text
                        style={[
                          styles.filterTabText,
                          isActive ? styles.filterTabTextActive : styles.filterTabTextInactive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Max Load Selector */}
              <Text style={styles.filterSectionTitle}>Max Load (tons)</Text>
              <View style={styles.loadSliderWrapper}>
                <Text style={styles.sliderLabel}>Up to {maxLoadFilter} tons</Text>
                <View style={styles.loadPills}>
                  {[5, 10, 15, 20, 25].map((tons) => (
                    <TouchableOpacity
                      key={tons}
                      style={[
                        styles.loadPill,
                        maxLoadFilter === tons ? styles.loadPillActive : styles.loadPillInactive,
                      ]}
                      onPress={() => setMaxLoadFilter(tons)}
                    >
                      <Text
                        style={[
                          styles.loadPillText,
                          maxLoadFilter === tons ? styles.loadPillTextActive : styles.loadPillTextInactive,
                        ]}
                      >
                        {tons}t
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Location filter */}
              <Text style={styles.filterSectionTitle}>Location</Text>
              <View style={styles.locationInputWrapper}>
                <Ionicons name="location-outline" size={18} color="#9E9E9E" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.locationInput}
                  placeholder="Enter city or region (e.g. Accra, Kumasi)..."
                  placeholderTextColor="#9E9E9E"
                  value={locationFilter}
                  onChangeText={setLocationFilter}
                />
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE0B2', // Warm light orange background tint
  },
  header: {
    backgroundColor: '#D84315', // Deep orange
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  filterIcon: {
    fontSize: 20,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchBarIcon: {
    fontSize: 16,
    color: '#9E9E9E',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
  },
  clearIcon: {
    fontSize: 14,
    color: '#9E9E9E',
    paddingHorizontal: 6,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#5D4037',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vehicleCard: {
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
  imageWrapper: {
    position: 'relative',
    height: 110,
    width: '100%',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFE0B2',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E65100',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDetails: {
    padding: 12,
  },
  truckType: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 6,
  },
  meta: {
    fontSize: 11,
    color: '#6d4c41',
    marginBottom: 3,
  },
  ratingText: {
    fontSize: 11,
    color: '#FFA000',
    fontWeight: 'bold',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 9,
    color: '#9E9E9E',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E65100',
  },
  bookBtn: {
    backgroundColor: '#E65100',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVehiclesCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  noVehiclesText: {
    color: '#212121',
    fontSize: 14,
    fontWeight: '600',
  },
  errorSnackbar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#C62828',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  modalCloseIcon: {
    fontSize: 18,
    color: '#9E9E9E',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
    marginTop: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabActive: {
    backgroundColor: '#FFE0B2',
    borderColor: '#E65100',
  },
  filterTabInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#E65100',
  },
  filterTabTextInactive: {
    color: '#757575',
  },
  loadSliderWrapper: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 8,
    fontWeight: '600',
  },
  loadPills: {
    flexDirection: 'row',
    gap: 10,
  },
  loadPill: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadPillActive: {
    backgroundColor: '#E65100',
    borderColor: '#E65100',
  },
  loadPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  loadPillText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadPillTextActive: {
    color: '#FFFFFF',
  },
  loadPillTextInactive: {
    color: '#757575',
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  locationInputIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#757575',
    fontWeight: 'bold',
    fontSize: 15,
  },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
