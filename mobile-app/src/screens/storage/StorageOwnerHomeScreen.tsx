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
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const HEADER_TINT = 'rgba(13, 71, 161, 0.28)';
const ACCENT = '#1565C0';

type BookingItem = {
  id: string;
  farmer: string;
  tons: string;
  dates: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
};

const icon = (codePoint: number) => String.fromCodePoint(codePoint);

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
    <Screen scroll>
      <GlassCard strength="strong" style={[styles.headerCard, { backgroundColor: HEADER_TINT }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Welcome, Storage Owner 🏭</Text>

          <TouchableOpacity activeOpacity={0.85} style={styles.bellWrap} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.bell}>{icon(0x1f514)}</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <GlassCard key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>
      </GlassCard>

      <View style={styles.section}>
        <View style={styles.quickRow}>
          <QuickAction label="Add Listing" onPress={() => navigation.navigate('AddStorage')} />
          <QuickAction label="Incoming Bookings" onPress={() => navigation.navigate('BookingsTab')} />
          <QuickAction label="My Facilities" onPress={() => navigation.navigate('FacilitiesTab')} />
          <QuickAction label="Earnings" onPress={() => navigation.navigate('AccountTab')} />
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
            <View key={uri} style={styles.heroSlide}>
              <GlassCard strength="strong" style={styles.heroCard}>
                <ImageBackground source={{ uri }} style={styles.hero} imageStyle={styles.heroImg}>
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Monetise Your Cold Room</Text>
                    <Text style={styles.heroSub}>List your facility and connect with farmers across Ghana.</Text>
                    <TouchableOpacity activeOpacity={0.9} style={styles.heroBtn} onPress={() => navigation.navigate('AddStorage')}>
                      <Text style={styles.heroBtnText}>List Now →</Text>
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
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('BookingsTab')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vList}>
        {bookings.map((b) => (
          <GlassCard key={b.id} style={styles.bookingCard}>
            <View style={styles.bookingRow}>
              <Text style={styles.bookingTitle}>{b.farmer}</Text>
              <View style={[styles.statusPill, statusStyle(b.status)]}>
                <Text style={styles.statusText}>{b.status}</Text>
              </View>
            </View>
            <Text style={styles.bookingMeta}>
              {b.tons} • {b.dates}
            </Text>
          </GlassCard>
        ))}
      </View>
    </Screen>
  );
};

function statusStyle(status: BookingItem['status']) {
  if (status === 'PENDING') return { backgroundColor: 'rgba(255, 111, 0, 0.85)' };
  if (status === 'CONFIRMED') return { backgroundColor: 'rgba(21, 101, 192, 0.85)' };
  return { backgroundColor: 'rgba(158, 158, 158, 0.75)' };
}

function QuickAction(props: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.qa} onPress={props.onPress}>
      <GlassCard strength="strong" style={styles.qaCard}>
        <Text style={styles.qaLabel}>{props.label}</Text>
        <Text style={styles.qaHint}>Tap to open</Text>
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

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: { flex: 1, padding: 14 },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '900' },
  statLabel: { marginTop: 6, color: colors.muted, fontWeight: '800', fontSize: 12 },

  section: { marginTop: spacing.md },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  qa: { width: '48%' },
  qaCard: { padding: 16, borderRadius: 20, borderColor: 'rgba(92,200,255,0.25)', backgroundColor: 'rgba(13,71,161,0.20)' },
  qaLabel: { color: colors.text, fontWeight: '900' },
  qaHint: { marginTop: 8, color: colors.muted, fontWeight: '700' },

  heroSlide: { width: '100%' },
  heroCard: { padding: 0, overflow: 'hidden' },
  hero: { height: 200, justifyContent: 'flex-end' },
  heroImg: { borderRadius: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  heroContent: { padding: 14 },
  heroTitle: { ...typography.h3, color: colors.text },
  heroSub: { color: colors.text, marginTop: 6, fontWeight: '700', opacity: 0.92, lineHeight: 18 },
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
  dotInactive: { backgroundColor: 'rgba(92,200,255,0.18)' },

  sectionHeader: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.h3, color: colors.text },
  seeAll: { color: ACCENT, fontWeight: '900' },

  vList: { gap: 10, marginTop: 12 },
  bookingCard: { padding: 14 },
  bookingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookingTitle: { color: colors.text, fontWeight: '900' },
  bookingMeta: { marginTop: 8, color: colors.muted, fontWeight: '700' },
  statusPill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: '#fff', fontWeight: '900', fontSize: 12 },
});

export default StorageOwnerHomeScreen;
