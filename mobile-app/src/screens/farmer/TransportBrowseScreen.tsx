import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { transportApi } from '../../api/transportApi';
import { TruckListing } from '../../types';

// Try to import react-native-maps, fallback to Picsum Image on web/error
let MapView: any = null;
try {
  MapView = require('react-native-maps').default;
} catch (e) {
  // Not available
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock Data
const QUICK_FILTERS = ['All', 'Available Now', 'Refrigerated', 'Bulk', 'Long Distance'];

export default function TransportBrowseScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [trucks, setTrucks] = useState<TruckListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [produceType, setProduceType] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const data = await transportApi.getTrucks();
        setTrucks(data);
      } catch (error) {
        console.error('Error fetching trucks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrucks();
  }, []);

  const handleBookNow = async (truck: TruckListing) => {
    try {
      const booking = await transportApi.bookTransport({
        truck_id: truck.id,
        pickup_location: truck.location || 'Kumasi',
        delivery_location: 'Accra',
        scheduled_date: new Date().toISOString(),
      });
      const driverName = `Transporter #${truck.transporter_id.substring(0, 4)}`;
      navigation.navigate('Tracking', {
        bookingId: booking.id,
        type: 'transport',
        transporterId: truck.transporter_id,
        driverName: driverName,
        vehicle: truck.truck_type,
        price: `GHS ${truck.price_per_km} / km`,
        jobDetails: JSON.stringify({
          pickup: truck.location || 'Kumasi',
          destination: 'Accra',
          maxLoad: `${truck.capacity_kg / 1000} tons`,
          produceType: 'Mixed Produce',
          weight: '10 tons',
        }),
      });
    } catch (error) {
      console.error('Error booking transport:', error);
      Alert.alert('Booking Failed', 'Could not create booking on backend.');
    }
  };

  const handleModalSubmit = async () => {
    setIsModalVisible(false);
    if (trucks.length === 0) {
      Alert.alert('No Trucks', 'There are no active transporters available to book.');
      return;
    }
    const truck = trucks[0];
    try {
      const booking = await transportApi.bookTransport({
        truck_id: truck.id,
        pickup_location: pickup || truck.location || 'Kumasi',
        delivery_location: destination || 'Accra',
        scheduled_date: new Date().toISOString(),
      });
      const driverName = `Transporter #${truck.transporter_id.substring(0, 4)}`;
      navigation.navigate('Tracking', {
        bookingId: booking.id,
        type: 'transport',
        transporterId: truck.transporter_id,
        driverName: driverName,
        vehicle: truck.truck_type,
        price: `GHS ${truck.price_per_km} / km`,
        jobDetails: JSON.stringify({
          pickup: pickup || truck.location || 'Kumasi',
          destination: destination || 'Accra',
          produceType: produceType || 'Maize',
          weight: weight || `${truck.capacity_kg / 1000} tons`,
        }),
      });
    } catch (error) {
      console.error('Error matching transport:', error);
      Alert.alert('Booking Failed', 'Could not auto-match or book transporter.');
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.headerIconContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transport</Text>
        <TouchableOpacity style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>⚡</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchIconBg}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location or produce type..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* HERO BANNER CARD */}
        <ImageBackground
          source={{ uri: 'https://picsum.photos/800/400' }}
          style={styles.heroBanner}
          imageStyle={styles.heroBannerImage}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Move Your Produce Fast</Text>
            <Text style={styles.heroSubtitle}>
              Trusted transporters across Ghana — book in minutes.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.heroButtonText}>Request Now →</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* QUICK FILTER TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {QUICK_FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterTab, isActive ? styles.filterTabActive : styles.filterTabInactive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterTabText, isActive ? styles.filterTabTextActive : styles.filterTabTextInactive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* AVAILABLE TRANSPORTERS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Transporters</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transporterList}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#E65100" />
          ) : trucks.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#757575', marginVertical: 20 }}>
              No transporters found
            </Text>
          ) : (
            trucks.map((truck) => {
              const driverName = `Transporter #${truck.transporter_id.substring(0, 4)}`;
              const rating = (4.5 + Math.random() * 0.5).toFixed(1);
              const trips = Math.floor(50 + Math.random() * 150);
              const avatar = `https://picsum.photos/id/1005/100/100`;

              return (
                <View key={truck.id} style={styles.transporterCard}>
                  <View style={styles.driverRow}>
                    <Image source={{ uri: avatar }} style={styles.driverAvatar} />
                    <View style={styles.driverInfo}>
                      <View style={styles.driverNameRow}>
                        <Text style={styles.driverName}>{driverName}</Text>
                        <Text style={styles.driverRating}>⭐ {rating} · {trips} trips</Text>
                      </View>
                      <Text style={styles.driverDetails}>🚛 {truck.truck_type}</Text>
                      <Text style={styles.driverDetails}>📍 Currently in: {truck.location}</Text>
                      <View style={styles.driverMetaRow}>
                        <Text style={styles.driverMeta}>Max Load: {truck.capacity_kg / 1000} tons</Text>
                        <Text style={styles.driverMeta}>Status: {truck.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.priceLabel}>Price Rate</Text>
                      <Text style={styles.priceValue}>GHS {truck.price_per_km} <Text style={styles.pricePer}>/ km</Text></Text>
                    </View>
                    <TouchableOpacity style={styles.bookButton} onPress={() => handleBookNow(truck)}>
                      <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>



        {/* HOW IT WORKS */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          
          <View style={styles.stepItem}>
            <Text style={styles.stepEmoji}>1️⃣</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepHeader}>Enter pickup & destination</Text>
              <Text style={styles.stepDesc}>Provide details of your load and destination to find matching drivers.</Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <Text style={styles.stepEmoji}>2️⃣</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepHeader}>Choose a transporter</Text>
              <Text style={styles.stepDesc}>Compare prices, truck models, ratings, and book the driver you prefer.</Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <Text style={styles.stepEmoji}>3️⃣</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepHeader}>Track your produce in real time</Text>
              <Text style={styles.stepDesc}>Get live GPS tracking and delivery confirmation upon arrival.</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* REQUEST TRANSPORT MODAL */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Transport</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pickup Location</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📍</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter pickup location"
                    placeholderTextColor="#9E9E9E"
                    value={pickup}
                    onChangeText={setPickup}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Destination</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🏁</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter destination"
                    placeholderTextColor="#9E9E9E"
                    value={destination}
                    onChangeText={setDestination}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Produce Type</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🌽</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="e.g. Maize, Yam, Tomatoes"
                    placeholderTextColor="#9E9E9E"
                    value={produceType}
                    onChangeText={setProduceType}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (tons)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>⚖️</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter weight in tons"
                    placeholderTextColor="#9E9E9E"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Date</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📅</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Select or enter preferred date"
                    placeholderTextColor="#9E9E9E"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleModalSubmit}>
                <Text style={styles.submitButtonText}>Find Transporters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0', // light orange tint
  },
  header: {
    backgroundColor: '#E65100', // deep orange
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // extra spacing for bottom layout & FAB
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIconBg: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchIconText: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
  },
  heroBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    marginBottom: 20,
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroBannerImage: {
    borderRadius: 16,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // dark overlay
  },
  heroContent: {
    padding: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 16,
    width: '80%',
  },
  heroButton: {
    backgroundColor: '#E65100',
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#E65100',
  },
  filterTabInactive: {
    backgroundColor: '#E0E0E0',
  },
  filterTabText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterTabTextInactive: {
    color: '#616161',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  seeAllText: {
    color: '#E65100',
    fontWeight: 'bold',
    fontSize: 14,
  },
  transporterList: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  transporterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  driverRating: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  driverDetails: {
    fontSize: 13,
    color: '#424242',
    marginBottom: 2,
  },
  driverMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  driverMeta: {
    fontSize: 12,
    color: '#757575',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
  pricePer: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#757575',
  },
  bookButton: {
    backgroundColor: '#E65100',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  routesContainer: {
    marginBottom: 24,
  },
  routesContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    width: 260,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mapThumbnailContainer: {
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  mapThumbnail: {
    width: '100%',
    height: '100%',
  },
  routeCardBody: {
    padding: 14,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 6,
  },
  routeInfo: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 2,
  },
  routePill: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  routePillText: {
    color: '#E65100',
    fontSize: 11,
    fontWeight: 'bold',
  },
  howItWorksCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepEmoji: {
    fontSize: 22,
    marginRight: 14,
    marginTop: 2,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: '#FFE0B2',
    marginLeft: 11,
    marginVertical: 4,
  },
  bottomSpacer: {
    height: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#E65100',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: Platform.OS === 'ios' ? 32 : 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#757575',
    fontWeight: 'bold',
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#616161',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  submitButton: {
    backgroundColor: '#E65100',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
