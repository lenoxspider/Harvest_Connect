import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const HEADER_BG = '#1B5E20';
const CONTENT_BG = '#F1F8E9';
const ACCENT = '#4CAF50';
const ACCENT_DARK = '#2E7D32';

const FarmerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const heroScrollRef = useRef<ScrollView>(null);
  const [activeHero, setActiveHero] = useState(0);
  const [query, setQuery] = useState('');

  const heroImages = useMemo(
    () => [
      'https://picsum.photos/800/450?random=11',
      'https://picsum.photos/800/450?random=12',
      'https://picsum.photos/800/450?random=13',
      'https://picsum.photos/800/450?random=14',
    ],
    []
  );

  const storageCards = useMemo(
    () => [
      { id: '1', name: 'Accra Cold Room', location: 'Greater Accra', price: 'GHS 65/ton/day', tons: '18 tons' },
      { id: '2', name: 'Kumasi Storage Hub', location: 'Ashanti', price: 'GHS 55/ton/day', tons: '26 tons' },
      { id: '3', name: 'Tamale Chill', location: 'Northern', price: 'GHS 45/ton/day', tons: '40 tons' },
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
          <Text style={styles.headerTitle}>Welcome, Farmer 🌾</Text>

          <TouchableOpacity activeOpacity={0.8} style={styles.bellWrap} onPress={() => navigation.navigate('AccountTab')}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search storage or transport..."
            placeholderTextColor="rgba(0,0,0,0.45)"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => navigation.navigate('SearchTab')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.quickRow}>
          <QuickAction
            label="Book Storage"
            imageUri="https://picsum.photos/400/300?random=21"
            tint={ACCENT}
            onPress={() => navigation.navigate('SearchTab')}
          />
          <QuickAction
            label="Request Transport"
            imageUri="https://picsum.photos/400/300?random=22"
            tint={ACCENT}
            onPress={() => navigation.navigate('SearchTab')}
          />
          <QuickAction
            label="My Produce"
            imageUri="https://picsum.photos/400/300?random=23"
            tint={ACCENT}
            onPress={() => navigation.navigate('ListingsTab')}
          />
          <QuickAction
            label="My Bookings"
            imageUri="https://picsum.photos/400/300?random=24"
            tint={ACCENT}
            onPress={() => navigation.navigate('OrdersTab')}
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
                <Text style={styles.heroTitle}>Store Your Harvest Safely</Text>
                <Text style={styles.heroSub}>Find cold rooms near you — book by the ton, pay per day.</Text>
                <Text style={styles.heroLoc}>📍 Ghana, West Africa</Text>
                <TouchableOpacity activeOpacity={0.9} style={styles.heroBtn} onPress={() => navigation.navigate('SearchTab')}>
                  <Text style={styles.heroBtnText}>Book Now →</Text>
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
          <Text style={styles.sectionTitle}>Available Storage Near You</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('SearchTab')}>
            <Text style={styles.seeMore}>See more</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {storageCards.map((c) => (
            <View key={c.id} style={styles.hCard}>
              <Image source={{ uri: `https://picsum.photos/400/300?random=3${c.id}` }} style={styles.hCardImg} />
              <View style={styles.hCardBody}>
                <Text style={styles.hCardTitle} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={styles.hCardMeta} numberOfLines={1}>
                  📍 {c.location}
                </Text>
                <Text style={styles.hCardPrice}>{c.price}</Text>
                <Text style={styles.hCardMeta}>Available: {c.tons}</Text>
              </View>
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

  searchWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#111', fontWeight: '600' },

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
  dotActive: { backgroundColor: ACCENT },
  dotInactive: { backgroundColor: 'rgba(76,175,80,0.25)' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#1B3B1E', fontSize: 16, fontWeight: '900' },
  seeMore: { color: ACCENT_DARK, fontWeight: '900' },

  hList: { paddingRight: 6 },
  hCard: { width: 210, marginRight: 12, borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' },
  hCardImg: { width: '100%', height: 105 },
  hCardBody: { padding: 12 },
  hCardTitle: { fontWeight: '900', color: '#102014' },
  hCardMeta: { marginTop: 6, color: 'rgba(16,32,20,0.65)', fontWeight: '700' },
  hCardPrice: { marginTop: 8, color: ACCENT_DARK, fontWeight: '900' },
});

export default FarmerHomeScreen;
