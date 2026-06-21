import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
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
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const HEADER_TINT = 'rgba(27, 94, 32, 0.28)';
const ACCENT_DARK = '#2E7D32';

const icon = (codePoint: number) => String.fromCodePoint(codePoint);

const FarmerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const heroScrollRef = useRef<ScrollView>(null);
  const [activeHero, setActiveHero] = useState(0);

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
    <Screen scroll>
      <GlassCard strength="strong" style={[styles.headerCard, { backgroundColor: HEADER_TINT }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Welcome, Farmer 🌾</Text>

          <TouchableOpacity activeOpacity={0.85} style={styles.bellWrap} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.bell}>{icon(0x1f514)}</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>

      </GlassCard>

      <View style={styles.section}>
        <View style={styles.quickRow}>
          <QuickAction
            label="Book Storage"
            imageUri="https://picsum.photos/400/300?random=21"
            onPress={() => navigation.navigate('SearchTab')}
          />
          <QuickAction
            label="Request Transport"
            imageUri="https://picsum.photos/400/300?random=22"
            onPress={() => navigation.navigate('SearchTab')}
          />
          <QuickAction
            label="My Produce"
            imageUri="https://picsum.photos/400/300?random=23"
            onPress={() => navigation.navigate('ListingsTab')}
          />
          <QuickAction
            label="My Bookings"
            imageUri="https://picsum.photos/400/300?random=24"
            onPress={() => navigation.navigate('OrdersTab')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onHeroScroll}
          scrollEventThrottle={16}
          ref={heroScrollRef}
        >
          {heroImages.map((uri) => (
            <View key={uri} style={styles.heroSlide}>
              <GlassCard strength="strong" style={styles.heroCard}>
                <ImageBackground source={{ uri }} style={styles.hero} imageStyle={styles.heroImg}>
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Store Your Harvest Safely</Text>
                    <Text style={styles.heroSub}>Find cold rooms near you — book by the ton, pay per day.</Text>
                    <Text style={styles.heroLoc}>{icon(0x1f4cd)} Ghana, West Africa</Text>
                    <TouchableOpacity activeOpacity={0.9} style={styles.heroBtn} onPress={() => navigation.navigate('SearchTab')}>
                      <Text style={styles.heroBtnText}>Book Now →</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </GlassCard>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {heroImages.map((_, idx) => (
            <View key={idx} style={[styles.dot, idx === activeHero ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Storage Near You</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('SearchTab')}>
          <Text style={styles.seeMore}>See more</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {storageCards.map((c) => (
          <GlassCard key={c.id} style={styles.hCard}>
            <Image source={{ uri: `https://picsum.photos/400/300?random=3${c.id}` }} style={styles.hCardImg} />
            <View style={styles.hCardBody}>
              <Text style={styles.hCardTitle} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={styles.hCardMeta} numberOfLines={1}>
                {icon(0x1f4cd)} {c.location}
              </Text>
              <Text style={styles.hCardPrice}>{c.price}</Text>
              <Text style={styles.hCardMeta}>Available: {c.tons}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </Screen>
  );
};

function QuickAction(props: { label: string; imageUri: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.qa} onPress={props.onPress}>
      <GlassCard style={styles.qaGlass}>
        <ImageBackground source={{ uri: props.imageUri }} style={styles.qaBg} imageStyle={styles.qaBgImg}>
          <View style={styles.qaTint} />
          <Text style={styles.qaLabel}>{props.label}</Text>
        </ImageBackground>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerCard: { padding: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { ...typography.h2, color: colors.text },
  bellWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bell: { color: colors.text, fontSize: 22 },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
  },

  section: { marginTop: spacing.md },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  qa: { width: '48%' },
  qaGlass: { padding: 0, overflow: 'hidden' },
  qaBg: { height: 96, justifyContent: 'flex-end' },
  qaBgImg: { borderRadius: 20 },
  qaTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(46,125,50,0.25)' },
  qaLabel: { color: colors.text, fontWeight: '900', padding: 12, fontSize: 14 },

  heroSlide: { width: '100%' },
  heroCard: { padding: 0, overflow: 'hidden' },
  hero: { height: 200, justifyContent: 'flex-end' },
  heroImg: { borderRadius: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  heroContent: { padding: 14 },
  heroTitle: { ...typography.h3, color: colors.text },
  heroSub: { color: colors.text, marginTop: 6, fontWeight: '700', opacity: 0.92, lineHeight: 18 },
  heroLoc: { color: colors.text, marginTop: 10, fontWeight: '800', opacity: 0.9 },
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
  dotActive: { backgroundColor: '#4CAF50' },
  dotInactive: { backgroundColor: 'rgba(124,255,178,0.18)' },

  sectionHeader: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.h3, color: colors.text },
  seeMore: { color: '#4CAF50', fontWeight: '900' },

  hList: { paddingRight: 6, marginTop: 12 },
  hCard: { width: 220, marginRight: 12, padding: 0, overflow: 'hidden' },
  hCardImg: { width: '100%', height: 110 },
  hCardBody: { padding: 14 },
  hCardTitle: { color: colors.text, fontWeight: '900' },
  hCardMeta: { marginTop: 6, color: colors.muted, fontWeight: '700' },
  hCardPrice: { marginTop: 8, color: colors.accent, fontWeight: '900' },
});

export default FarmerHomeScreen;
