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

const ACCENT = '#C0392B';

type Category = {
  id: 'storage' | 'produce' | 'transport' | 'logistics';
  title: string;
  imageUri: string;
};

const ExploreHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const heroScrollRef = useRef<ScrollView>(null);
  const [activeHero, setActiveHero] = useState(0);
  const [query, setQuery] = useState('');

  const categories: Category[] = useMemo(
    () => [
      { id: 'storage', title: 'Storage', imageUri: 'https://picsum.photos/400/300?random=71' },
      { id: 'produce', title: 'Produce', imageUri: 'https://picsum.photos/400/300?random=72' },
      { id: 'transport', title: 'Transport', imageUri: 'https://picsum.photos/400/300?random=73' },
      { id: 'logistics', title: 'Logistics', imageUri: 'https://picsum.photos/400/300?random=74' },
    ],
    []
  );

  const heroImages = useMemo(
    () => [
      'https://picsum.photos/800/450?random=81',
      'https://picsum.photos/800/450?random=82',
      'https://picsum.photos/800/450?random=83',
      'https://picsum.photos/800/450?random=84',
    ],
    []
  );

  const featured = useMemo(
    () => [
      { id: '1', name: 'Tema Cold Storage', location: 'Greater Accra', price: 'GHS 70/ton' },
      { id: '2', name: 'Koforidua Warehouse', location: 'Eastern', price: 'GHS 58/ton' },
      { id: '3', name: 'Takoradi Hub', location: 'Western', price: 'GHS 62/ton' },
    ],
    []
  );

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const w = e.nativeEvent.layoutMeasurement.width;
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / Math.max(1, w));
    setActiveHero(Math.max(0, Math.min(heroImages.length - 1, idx)));
  };

  const openCategory = (cat: Category['id']) => {
    if (cat === 'produce') {
      navigation.navigate('ProduceList');
      return;
    }
    // For now, route to Search/Videos/Maps tabs depending on what exists.
    navigation.navigate('MapsTab');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search listings..."
            placeholderTextColor="rgba(0,0,0,0.45)"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn} onPress={() => navigation.navigate('ProfileTab')}>
            <Text style={styles.iconText}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn} onPress={() => navigation.navigate('ProfileTab')}>
            <Text style={styles.iconText}>🔔</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryRow}>
        {categories.map((c) => (
          <TouchableOpacity key={c.id} activeOpacity={0.9} style={styles.categoryCard} onPress={() => openCategory(c.id)}>
            <ImageBackground source={{ uri: c.imageUri }} style={styles.categoryBg} imageStyle={styles.categoryBgImg}>
              <View style={styles.categoryOverlay} />
              <Text style={styles.categoryLabel}>{c.title}</Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.heroSection}>
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
                <Text style={styles.heroTitle}>HarvestConnect Storage</Text>
                <Text style={styles.heroSub}>
                  Secure cold storage for your harvest — book by the ton, pay per day.
                </Text>
                <Text style={styles.heroLoc}>📍 Ghana, West Africa</Text>
                <TouchableOpacity activeOpacity={0.9} style={styles.heroBtn} onPress={() => navigation.navigate('BookingsTab')}>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Listings</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('MapsTab')}>
          <Text style={styles.seeMore}>See more</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {featured.map((f) => (
          <View key={f.id} style={styles.hCard}>
            <Image source={{ uri: `https://picsum.photos/400/300?random=9${f.id}` }} style={styles.hCardImg} />
            <View style={styles.hCardBody}>
              <Text style={styles.hCardTitle} numberOfLines={1}>
                {f.name}
              </Text>
              <Text style={styles.hCardMeta} numberOfLines={1}>
                📍 {f.location}
              </Text>
              <Text style={styles.hCardPrice}>{f.price}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 18 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#111', fontWeight: '600' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 18, color: '#111' },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#E53935',
    borderWidth: 2,
    borderColor: '#fff',
  },

  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 14 },
  categoryCard: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  categoryBg: { height: 82, justifyContent: 'flex-end' },
  categoryBgImg: { borderRadius: 12 },
  categoryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  categoryLabel: { color: '#fff', fontWeight: '900', padding: 10 },

  heroSection: { marginTop: 14 },
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
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroBtnText: { color: '#fff', fontWeight: '900' },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 10 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  dotActive: { backgroundColor: ACCENT },
  dotInactive: { backgroundColor: 'rgba(0,0,0,0.25)' },

  sectionHeader: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#111' },
  seeMore: { color: ACCENT, fontWeight: '900' },

  hList: { paddingRight: 6, marginTop: 12 },
  hCard: { width: 210, marginRight: 12, borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  hCardImg: { width: '100%', height: 105 },
  hCardBody: { padding: 12 },
  hCardTitle: { fontWeight: '900', color: '#111' },
  hCardMeta: { marginTop: 6, color: 'rgba(17,17,17,0.60)', fontWeight: '700' },
  hCardPrice: { marginTop: 8, color: ACCENT, fontWeight: '900' },
});

export default ExploreHomeScreen;

