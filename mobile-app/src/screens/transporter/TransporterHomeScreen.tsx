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

const HEADER_TINT = 'rgba(230, 81, 0, 0.22)';
const ACCENT = '#E65100';

type JobItem = {
  id: string;
  pickup: string;
  destination: string;
  produce: string;
  tons: string;
  price: string;
};

const icon = (codePoint: number) => String.fromCodePoint(codePoint);

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
    <Screen scroll>
      <GlassCard strength="strong" style={[styles.headerCard, { backgroundColor: HEADER_TINT }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Welcome, Transporter 🚛</Text>

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
          <QuickAction label="Available Jobs" onPress={() => navigation.navigate('BookingsTab')} />
          <QuickAction label="My Routes" onPress={() => navigation.navigate('TrucksTab')} />
          <QuickAction label="My Vehicle" onPress={() => navigation.navigate('TrucksTab')} />
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
                    <Text style={styles.heroTitle}>Find Transport Jobs Near You</Text>
                    <Text style={styles.heroSub}>Connect with farmers who need their produce moved across Ghana.</Text>
                    <Text style={styles.heroLoc}>{icon(0x1f4cd)} Ghana, West Africa</Text>
                    <TouchableOpacity activeOpacity={0.9} style={styles.heroBtn} onPress={() => navigation.navigate('BookingsTab')}>
                      <Text style={styles.heroBtnText}>Find Jobs →</Text>
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
        <Text style={styles.sectionTitle}>Available Transport Requests</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('BookingsTab')}>
          <Text style={styles.seeMore}>See more</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {jobs.map((j) => (
          <GlassCard key={j.id} style={styles.jobCard} strength="strong">
            <Text style={styles.jobTitle} numberOfLines={1}>
              {j.pickup} → {j.destination}
            </Text>
            <Text style={styles.jobMeta}>
              {j.produce} • {j.tons}
            </Text>
            <Text style={styles.jobPrice}>{j.price}</Text>
            <TouchableOpacity activeOpacity={0.9} style={styles.acceptBtn} onPress={() => navigation.navigate('BookingsTab')}>
              <Text style={styles.acceptText}>Accept Job</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}
      </ScrollView>
    </Screen>
  );
};

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
  qaCard: { padding: 16, borderRadius: 20, borderColor: 'rgba(255,156,92,0.20)', backgroundColor: 'rgba(230,81,0,0.18)' },
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
  heroLoc: { color: colors.text, marginTop: 10, fontWeight: '800', opacity: 0.9 },
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
  dotInactive: { backgroundColor: 'rgba(255,156,92,0.18)' },

  sectionHeader: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.h3, color: colors.text },
  seeMore: { color: ACCENT, fontWeight: '900' },

  hList: { paddingRight: 6, marginTop: 12 },
  jobCard: { width: 250, marginRight: 12, padding: 14 },
  jobTitle: { color: colors.text, fontWeight: '900' },
  jobMeta: { marginTop: 8, color: colors.muted, fontWeight: '700' },
  jobPrice: { marginTop: 10, color: colors.accent, fontWeight: '900' },
  acceptBtn: { marginTop: 12, backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '900' },
});

export default TransporterHomeScreen;
