import React, { useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const HEADER_BG = '#0D47A1';
const CONTENT_BG = '#E3F2FD';
const ACCENT = '#1565C0';

type BookingItem = {
  id: string;
  farmer: string;
  tons: string;
  dates: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
};

const StorageOwnerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const heroScrollRef = useRef<ScrollView>(null);
  const [activeHero, setActiveHero] = useState(0);

  const heroImages = useMemo(
    () => [
      'https://picsum.photos/800/450?random=31',
      'https://picsum.photos/800/450?random=32',
      'https://picsum.photos/800/450?random=33',
      'https://picsum.photos/800/450?random=34',
    ],
    []
  );

  const stats = useMemo(
    () => [
      { label: 'Total Listings', value: '3' },
      { label: 'Active Bookings', value: '5' },
      { label: 'Revenue (GHS)', value: '1,250' },
    ],
    []
  );

  const bookings: BookingItem[] = useMemo(
    () => [
      { id: '1', farmer: 'Kwame A.', tons: '8 tons', dates: 'Jun 18–Jun 22', status: 'PENDING' },
      { id: '2', farmer: 'Ama K.', tons: '5 tons', dates: 'Jun 15–Jun 20', status: 'CONFIRMED' },
      { id: '3', farmer: 'Yaw B.', tons: '2 tons', dates: 'Jun 10–Jun 12', status: 'COMPLETED' },
    ],
    []
  );

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const w = e.nativeEvent.layoutMeasurement.width;
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / Math.max(1, w));
    setActiveHero(Math.max(0, Math.min(heroImages.length - 1, idx)));
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Welcome, Storage Owner 🏭</Text>

          <TouchableOpacity activeOpacity={0.8} style={styles.bellWrap} onPress={() => navigation.navigate('AccountTab')}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.quickRow}>
          <QuickAction
            label="Add Listing"
            imageUri="https://picsum.photos/400/300?random=41"
            tint={ACCENT}
            onPress={() => navigation.navigate('AddStorage')}
          />
          <QuickAction
            label="Incoming Bookings"
            imageUri="https://picsum.photos/400/300?random=42"
            tint={ACCENT}
            onPress={() => navigation.navigate('BookingsTab')}
          />
          <QuickAction
            label="My Facilities"
            imageUri="https://picsum.photos/400/300?random=43"
            tint={ACCENT}
            onPress={() => navigation.navigate('FacilitiesTab')}
          />
          <QuickAction
            label="Earnings"
            imageUri="https://picsum.photos/400/300?random=44"
            tint={ACCENT}
            onPress={() => navigation.navigate('AccountTab')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ScrollView
          ref={heroScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onHeroScroll}
          scrollEventThrottle={16}
        >
          {heroImages.map((uri) => (
            <ImageBackground key={uri} source={{ uri }} style={styles.hero} imageStyle={styles.heroImg}>
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Monetise Your Cold Room</Text>
                <Text style={styles.heroSub}>List your facility and connect with farmers across Ghana.</Text>
                <TouchableOpacity activeOpacity={0.9} style={styles.heroBtn} onPress={() => navigation.navigate('AddStorage')}>
                  <Text style={styles.heroBtnText}>List Now →</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {heroImages.map((_, idx) => (
            <View key={idx} style={[styles.dot, idx === activeHero ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('BookingsTab')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vList}>
          {bookings.map((b) => (
            <View key={b.id} style={styles.bookingCard}>
              <View style={styles.bookingRow}>
                <Text style={styles.bookingTitle}>{b.farmer}</Text>
                <View style={[styles.statusPill, statusStyle(b.status).pill]}>
                  <Text style={[styles.statusText, statusStyle(b.status).text]}>{b.status}</Text>
                </View>
              </View>
              <Text style={styles.bookingMeta}>{b.tons} • {b.dates}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

function statusStyle(status: BookingItem['status']) {
  if (status === 'PENDING') {
    return { pill: { backgroundColor: '#FF6F00' }, text: { color: '#fff' } };
  }
  if (status === 'CONFIRMED') {
    return { pill: { backgroundColor: ACCENT }, text: { color: '#fff' } };
  }
  return { pill: { backgroundColor: '#9E9E9E' }, text: { color: '#fff' } };
}

function QuickAction(props: { label: string; imageUri: string; tint: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.qa} onPress={props.onPress}>
      <ImageBackground source={{ uri: props.imageUri }} style={styles.qaBg} imageStyle={styles.qaBgImg}>
        <View style={[styles.qaTint, { backgroundColor: props.tint }]} />
        <Text style={styles.qaLabel}>{props.label}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CONTENT_BG },
  content: { paddingBottom: 18 },

  header: {
    backgroundColor: HEADER_BG,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  bellWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bell: { color: '#fff', fontSize: 22 },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#E53935',
    borderWidth: 2,
    borderColor: HEADER_BG,
  },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statValue: { color: '#0B1B2B', fontSize: 18, fontWeight: '900' },
  statLabel: { marginTop: 4, color: 'rgba(11,27,43,0.55)', fontWeight: '800', fontSize: 12 },

  section: { paddingHorizontal: 16, paddingTop: 14 },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  qa: { width: '48%', borderRadius: 12, overflow: 'hidden' },
  qaBg: { height: 96, justifyContent: 'flex-end' },
  qaBgImg: { borderRadius: 12 },
  qaTint: { ...StyleSheet.absoluteFillObject, opacity: 0.45 },
  qaLabel: { color: '#fff', fontWeight: '900', padding: 10, fontSize: 14 },

  hero: { width: '100%', height: 190, borderRadius: 12, overflow: 'hidden' },
  heroImg: { borderRadius: 12 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  heroContent: { flex: 1, padding: 14, justifyContent: 'flex-end' },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  heroSub: { color: 'rgba(255,255,255,0.92)', marginTop: 6, fontWeight: '600', lineHeight: 18 },
  heroBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroBtnText: { color: '#fff', fontWeight: '900' },

  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 10 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  dotActive: { backgroundColor: ACCENT },
  dotInactive: { backgroundColor: 'rgba(21,101,192,0.25)' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#0B1B2B', fontSize: 16, fontWeight: '900' },
  seeAll: { color: ACCENT, fontWeight: '900' },

  vList: { gap: 10 },
  bookingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  bookingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookingTitle: { color: '#0B1B2B', fontWeight: '900' },
  bookingMeta: { marginTop: 8, color: 'rgba(11,27,43,0.60)', fontWeight: '700' },
  statusPill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontWeight: '900', fontSize: 12 },
});

export default StorageOwnerHomeScreen;
