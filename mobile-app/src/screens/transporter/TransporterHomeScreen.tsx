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

const HEADER_BG = '#E65100';
const CONTENT_BG = '#FFF3E0';
const ACCENT = '#F57C00';
const ACCENT_DARK = '#E65100';

type JobItem = {
  id: string;
  pickup: string;
  destination: string;
  produce: string;
  tons: string;
  price: string;
};

const TransporterHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const heroScrollRef = useRef<ScrollView>(null);
  const [activeHero, setActiveHero] = useState(0);

  const heroImages = useMemo(
    () => [
      'https://picsum.photos/800/450?random=51',
      'https://picsum.photos/800/450?random=52',
      'https://picsum.photos/800/450?random=53',
      'https://picsum.photos/800/450?random=54',
    ],
    []
  );

  const stats = useMemo(
    () => [
      { label: 'Trips Today', value: '2' },
      { label: 'Pending Jobs', value: '4' },
      { label: 'Earnings (GHS)', value: '680' },
    ],
    []
  );

  const jobs: JobItem[] = useMemo(
    () => [
      { id: '1', pickup: 'Dodowa', destination: 'Madina', produce: 'Tomatoes', tons: '3 tons', price: 'GHS 220' },
      { id: '2', pickup: 'Nsawam', destination: 'Accra', produce: 'Onions', tons: '5 tons', price: 'GHS 350' },
      { id: '3', pickup: 'Kumasi', destination: 'Techiman', produce: 'Yam', tons: '4 tons', price: 'GHS 300' },
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
          <Text style={styles.headerTitle}>Welcome, Transporter 🚛</Text>

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
            label="Available Jobs"
            imageUri="https://picsum.photos/400/300?random=61"
            tint={ACCENT}
            onPress={() => navigation.navigate('BookingsTab')}
          />
          <QuickAction
            label="My Routes"
            imageUri="https://picsum.photos/400/300?random=62"
            tint={ACCENT}
            onPress={() => navigation.navigate('TrucksTab')}
          />
          <QuickAction
            label="My Vehicle"
            imageUri="https://picsum.photos/400/300?random=63"
            tint={ACCENT}
            onPress={() => navigation.navigate('TrucksTab')}
          />
          <QuickAction
            label="Earnings"
            imageUri="https://picsum.photos/400/300?random=64"
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
                <Text style={styles.heroTitle}>Find Transport Jobs Near You</Text>
                <Text style={styles.heroSub}>Connect with farmers who need their produce moved across Ghana.</Text>
                <Text style={styles.heroLoc}>📍 Ghana, West Africa</Text>
                <TouchableOpacity activeOpacity={0.9} style={styles.heroBtn} onPress={() => navigation.navigate('BookingsTab')}>
                  <Text style={styles.heroBtnText}>Find Jobs →</Text>
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
          <Text style={styles.sectionTitle}>Available Transport Requests</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('BookingsTab')}>
            <Text style={styles.seeMore}>See more</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {jobs.map((j) => (
            <View key={j.id} style={styles.jobCard}>
              <Text style={styles.jobTitle} numberOfLines={1}>{j.pickup} → {j.destination}</Text>
              <Text style={styles.jobMeta}>{j.produce} • {j.tons}</Text>
              <Text style={styles.jobPrice}>{j.price}</Text>
              <TouchableOpacity activeOpacity={0.9} style={styles.acceptBtn} onPress={() => navigation.navigate('BookingsTab')}>
                <Text style={styles.acceptText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

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
  statValue: { color: '#2C1400', fontSize: 18, fontWeight: '900' },
  statLabel: { marginTop: 4, color: 'rgba(44,20,0,0.55)', fontWeight: '800', fontSize: 12 },

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
  heroLoc: { color: 'rgba(255,255,255,0.92)', marginTop: 10, fontWeight: '800' },
  heroBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: ACCENT_DARK,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroBtnText: { color: '#fff', fontWeight: '900' },

  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 10 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  dotActive: { backgroundColor: ACCENT_DARK },
  dotInactive: { backgroundColor: 'rgba(230,81,0,0.22)' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#2C1400', fontSize: 16, fontWeight: '900' },
  seeMore: { color: ACCENT_DARK, fontWeight: '900' },

  hList: { paddingRight: 6 },
  jobCard: { width: 240, marginRight: 12, borderRadius: 12, backgroundColor: '#fff', padding: 12 },
  jobTitle: { color: '#2C1400', fontWeight: '900' },
  jobMeta: { marginTop: 8, color: 'rgba(44,20,0,0.60)', fontWeight: '700' },
  jobPrice: { marginTop: 10, color: ACCENT_DARK, fontWeight: '900' },
  acceptBtn: { marginTop: 12, backgroundColor: ACCENT_DARK, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '900' },
});

export default TransporterHomeScreen;
