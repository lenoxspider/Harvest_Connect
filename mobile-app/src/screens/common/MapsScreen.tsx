// src/screens/common/MapsScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { buyerApi, FarmerProfile } from '../../api/buyerApi';
import { storageApi } from '../../api/storageApi';
import { transportApi } from '../../api/transportApi';
import { StorageListing, TransportBooking } from '../../types';

const { width: SW } = Dimensions.get('window');

// ─── Ghana bounding box default ────────────────────────────────────────────
const GHANA_REGION: Region = {
  latitude: 7.9465,
  longitude: -1.0232,
  latitudeDelta: 6,
  longitudeDelta: 6,
};

// Known city coordinates for Ghana (used when geocoding isn't available)
const KNOWN_COORDS: Record<string, { latitude: number; longitude: number }> = {
  accra:       { latitude: 5.6037,  longitude: -0.1870  },
  kumasi:      { latitude: 6.6885,  longitude: -1.6244  },
  tamale:      { latitude: 9.4008,  longitude: -0.8393  },
  takoradi:    { latitude: 4.8845,  longitude: -1.7554  },
  cape coast:  { latitude: 5.1053,  longitude: -1.2466  },
  sunyani:     { latitude: 7.3349,  longitude: -2.3284  },
  bolgatanga:  { latitude: 10.7855, longitude: -0.8514  },
  wa:          { latitude: 10.0601, longitude: -2.5099  },
  ho:          { latitude: 6.6026,  longitude: 0.4711   },
  koforidua:   { latitude: 6.0940,  longitude: -0.2607  },
  techiman:    { latitude: 7.5893,  longitude: -1.9342  },
  obuasi:      { latitude: 6.2011,  longitude: -1.6710  },
  tema:        { latitude: 5.6698,  longitude: -0.0166  },
};

function locationToCoords(location: string, index: number) {
  const lower = location.toLowerCase().trim();
  for (const [city, coords] of Object.entries(KNOWN_COORDS)) {
    if (lower.includes(city)) {
      // Spread overlapping pins with a tiny random scatter
      const scatter = (index % 7) * 0.008;
      return {
        latitude: coords.latitude + scatter * Math.sin(index),
        longitude: coords.longitude + scatter * Math.cos(index),
      };
    }
  }
  // Unknown location — place in Ghana centre with offset
  const seed = location.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    latitude: GHANA_REGION.latitude + ((seed % 20) - 10) * 0.2,
    longitude: GHANA_REGION.longitude + ((seed % 20) - 10) * 0.2,
  };
}

// ─── Filter chip types ──────────────────────────────────────────────────────
type Filter = 'all' | 'farmers' | 'storage' | 'transport';

const FILTERS: { id: Filter; label: string; emoji: string }[] = [
  { id: 'all',       label: 'All',       emoji: '🗺️'  },
  { id: 'farmers',   label: 'Farmers',   emoji: '🌾'  },
  { id: 'storage',   label: 'Storage',   emoji: '🏭'  },
  { id: 'transport', label: 'Transport', emoji: '🚚'  },
];

// ─── Marker types ───────────────────────────────────────────────────────────
interface MapPin {
  id: string;
  type: 'farmer' | 'storage' | 'pickup' | 'delivery';
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  pinColor: string;
}

export default function MapsScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [region, setRegion] = useState<Region>(GHANA_REGION);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const slideAnim = useRef(new Animated.Value(120)).current;

  // ─── Load all data ────────────────────────────────────────────────────────
  const loadPins = useCallback(async () => {
    setLoading(true);
    const results: MapPin[] = [];

    // 1. Farmers
    try {
      const farmers: FarmerProfile[] = await buyerApi.getFarmers();
      farmers.forEach((f, i) => {
        const coords = locationToCoords(f.region || 'Accra', i);
        results.push({
          id: `farmer-${f.id}`,
          type: 'farmer',
          title: f.fullName,
          subtitle: `📍 ${f.region} · ⭐ ${f.rating.toFixed(1)}`,
          pinColor: '#2E7D32',
          ...coords,
        });
      });
    } catch { /* skip if API fails */ }

    // 2. Storage listings
    try {
      const listings: StorageListing[] = await storageApi.getListings();
      listings.forEach((s, i) => {
        const coords = locationToCoords(s.location || 'Accra', i + 50);
        results.push({
          id: `storage-${s.id}`,
          type: 'storage',
          title: s.facility_name,
          subtitle: `📍 ${s.location} · ${s.available_tons}t available · GHS ${s.price_per_ton_per_day}/t/day`,
          pinColor: '#1565C0',
          ...coords,
        });
      });
    } catch { /* skip */ }

    // 3. Transport bookings (pickup + delivery points)
    try {
      const bookings: TransportBooking[] = await transportApi.getMyBookings();
      bookings.forEach((b, i) => {
        const pickupCoords = locationToCoords(b.pickup_location || 'Accra', i + 100);
        results.push({
          id: `pickup-${b.id}`,
          type: 'pickup',
          title: `Pickup: ${b.pickup_location}`,
          subtitle: `🚛 Status: ${b.status}`,
          pinColor: '#F57C00',
          ...pickupCoords,
        });

        const deliveryCoords = locationToCoords(b.delivery_location || 'Kumasi', i + 150);
        results.push({
          id: `delivery-${b.id}`,
          type: 'delivery',
          title: `Delivery: ${b.delivery_location}`,
          subtitle: `🏁 Status: ${b.status} · GHS ${b.total_cost}`,
          pinColor: '#C62828',
          ...deliveryCoords,
        });
      });
    } catch { /* skip */ }

    setPins(results);
    setLoading(false);
  }, []);

  // ─── Request location permission + centre map ────────────────────────────
  useEffect(() => {
    (async () => {
      await loadPins();
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          const userRegion: Region = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          };
          setRegion(userRegion);
          mapRef.current?.animateToRegion(userRegion, 800);
        }
      } catch { /* use default Ghana region */ }
    })();
  }, []);

  // ─── Animate info card up/down when pin selected ─────────────────────────
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedPin ? 0 : 120,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [selectedPin]);

  // ─── Filtered pins ────────────────────────────────────────────────────────
  const visiblePins = pins.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'farmers') return p.type === 'farmer';
    if (filter === 'storage') return p.type === 'storage';
    if (filter === 'transport') return p.type === 'pickup' || p.type === 'delivery';
    return true;
  });

  const counts = {
    farmers:   pins.filter(p => p.type === 'farmer').length,
    storage:   pins.filter(p => p.type === 'storage').length,
    transport: pins.filter(p => p.type === 'pickup').length,
  };

  return (
    <View style={styles.root}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Produce Map</Text>
          <Text style={styles.headerSub}>
            {counts.farmers} farmers · {counts.storage} storage · {counts.transport} routes
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadPins}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter chips ────────────────────────────────────────────── */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, filter === f.id && styles.chipActive]}
              onPress={() => { setFilter(f.id); setSelectedPin(null); }}
            >
              <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>
                {f.emoji} {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Map ─────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E5631" />
          <Text style={styles.loadingText}>Loading map data…</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
          onPress={() => setSelectedPin(null)}
        >
          {visiblePins.map(pin => (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              pinColor={pin.pinColor}
              onPress={() => setSelectedPin(pin)}
            >
              <Callout tooltip={false}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle} numberOfLines={2}>{pin.title}</Text>
                  <Text style={styles.calloutSub} numberOfLines={2}>{pin.subtitle}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {/* ── Legend ─────────────────────────────────────────────────── */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
          <Text style={styles.legendLabel}>Farmer</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#1565C0' }]} />
          <Text style={styles.legendLabel}>Storage</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F57C00' }]} />
          <Text style={styles.legendLabel}>Pickup</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#C62828' }]} />
          <Text style={styles.legendLabel}>Delivery</Text>
        </View>
      </View>

      {/* ── Bottom info card (slides up on pin tap) ─────────────────── */}
      {selectedPin && (
        <Animated.View style={[styles.infoCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.infoHandle} />
          <Text style={styles.infoTitle}>{selectedPin.title}</Text>
          <Text style={styles.infoSub}>{selectedPin.subtitle}</Text>
          <TouchableOpacity
            style={[
              styles.infoBtn,
              {
                backgroundColor:
                  selectedPin.type === 'farmer' ? '#2E7D32' :
                  selectedPin.type === 'storage' ? '#1565C0' : '#F57C00',
              },
            ]}
            onPress={() => {
              setSelectedPin(null);
              if (selectedPin.type === 'storage') {
                navigation.navigate('StorageBrowse' as never);
              } else if (selectedPin.type === 'farmer') {
                navigation.navigate('BrowseTab' as never);
              } else {
                navigation.navigate('HomeTab' as never);
              }
            }}
          >
            <Text style={styles.infoBtnText}>
              {selectedPin.type === 'storage' ? 'Browse Storage →' :
               selectedPin.type === 'farmer'  ? 'Browse Produce →' :
                                                'View Bookings →'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E5631',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  backBtn: { padding: 4, width: 40 },
  backArrow: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  refreshBtn: { padding: 4, width: 40, alignItems: 'flex-end' },
  refreshIcon: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },

  // Filter chips
  filterBar: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActive: {
    backgroundColor: '#1E5631',
    borderColor: '#1E5631',
  },
  chipText: { fontSize: 13, fontWeight: '700', color: '#555' },
  chipTextActive: { color: '#FFF' },

  // Map
  map: { flex: 1 },

  // Loading
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  loadingText: { color: '#1E5631', fontWeight: '700', fontSize: 15 },

  // Callout
  callout: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    minWidth: 160,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutTitle: { fontWeight: '800', fontSize: 13, color: '#212121', marginBottom: 2 },
  calloutSub: { fontSize: 11, color: '#616161' },

  // Legend
  legend: {
    position: 'absolute',
    top: 148,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    gap: 5,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, fontWeight: '700', color: '#424242' },

  // Bottom info card
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  infoHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  infoTitle: { fontSize: 16, fontWeight: '900', color: '#212121', marginBottom: 4 },
  infoSub: { fontSize: 13, color: '#616161', marginBottom: 16, lineHeight: 18 },
  infoBtn: {
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
