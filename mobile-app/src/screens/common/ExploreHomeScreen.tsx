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
import { Alert } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Screen } from '../../ui/Screen';
import { useHomepageSettings } from '../../hooks/useHomepageSettings';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#C0392B';

type Category = {
  id: 'storage' | 'produce' | 'transport' | 'logistics';
  title: string;
  imageUri: string;
};

const icon = (codePoint: number) => String.fromCodePoint(codePoint);

const ExploreHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const heroScrollRef = useRef<ScrollView>(null);
  const [activeHero, setActiveHero] = useState(0);
  const [query, setQuery] = useState('');
  const { settings } = useHomepageSettings();
  const { user } = useAuth();

  const canNavigateTo = (routeName: string) => {
    const state = navigation.getState?.();
    return Boolean(state && Array.isArray(state.routeNames) && state.routeNames.includes(routeName));
  };

  const categories: Category[] = useMemo(
    () => [
      { id: 'storage', title: 'Storage', imageUri: settings.categoryStorageImage },
      { id: 'produce', title: 'Produce', imageUri: settings.categoryProduceImage },
      { id: 'transport', title: 'Transport', imageUri: settings.categoryTransportImage },
      { id: 'logistics', title: 'Logistics', imageUri: settings.categoryLogisticsImage },
    ],
    [
      settings.categoryStorageImage,
      settings.categoryProduceImage,
      settings.categoryTransportImage,
      settings.categoryLogisticsImage,
    ]
  );

  const heroImages = useMemo(
    () => [
      settings.heroImage1,
      settings.heroImage2,
      settings.heroImage3,
      settings.heroImage4,
    ],
    [settings.heroImage1, settings.heroImage2, settings.heroImage3, settings.heroImage4]
  );

  const featured = useMemo(
    () => [
      { id: '1', name: 'Tema Cold Storage', location: 'Greater Accra', price: 'GHS 70/ton', imageUri: settings.featuredImage1 },
      { id: '2', name: 'Koforidua Warehouse', location: 'Eastern', price: 'GHS 58/ton', imageUri: settings.featuredImage2 },
      { id: '3', name: 'Takoradi Hub', location: 'Western', price: 'GHS 62/ton', imageUri: settings.featuredImage3 },
    ],
    [settings.featuredImage1, settings.featuredImage2, settings.featuredImage3]
  );

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const w = e.nativeEvent.layoutMeasurement.width;
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / Math.max(1, w));
    setActiveHero(Math.max(0, Math.min(heroImages.length - 1, idx)));
  };

  const openCategory = (cat: Category['id']) => {
    if (cat === 'produce') {
      if (!user) {
        if (canNavigateTo('Login')) navigation.navigate('Login');
        return;
      }

      if (user.role === 'BUYER' && canNavigateTo('ProduceList')) {
        navigation.navigate('ProduceList');
        return;
      }

      Alert.alert('Not available', 'Produce listings are available for BUYER accounts only.');
      return;
    }
    // Public flow: require login for now.
    if (canNavigateTo('Login')) navigation.navigate('Login');
  };

  return (
    <Screen scroll>
      <GlassCard strength="strong" style={styles.headerCard}>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>{icon(0x1f50d)}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search listings..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
          <TouchableOpacity activeOpacity={0.85} style={styles.iconBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.iconText}>{icon(0x2661)}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.iconBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.iconText}>{icon(0x1f514)}</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.ctaRow}>
          <GlassButton title="Login" onPress={() => navigation.navigate('Login')} style={{ flex: 1 }} />
          <GlassButton
            title="Create account"
            onPress={() => navigation.navigate('Register')}
            variant="secondary"
            style={{ flex: 1 }}
          />
        </View>
      </GlassCard>

      <View style={styles.categoryRow}>
        {categories.map((c) => (
          <TouchableOpacity key={c.id} activeOpacity={0.9} style={styles.categoryCard} onPress={() => openCategory(c.id)}>
            <GlassCard style={styles.categoryGlass}>
              <ImageBackground source={{ uri: c.imageUri }} style={styles.categoryBg} imageStyle={styles.categoryBgImg}>
                <View style={styles.categoryOverlay} />
                <Text style={styles.categoryLabel}>{c.title}</Text>
              </ImageBackground>
            </GlassCard>
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
            <View key={uri} style={styles.heroSlide}>
              <GlassCard strength="strong" style={styles.heroCard}>
                <ImageBackground source={{ uri }} style={styles.hero} imageStyle={styles.heroImg}>
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>HarvestConnect Storage</Text>
                    <Text style={styles.heroSub}>
                      Secure cold storage for your harvest — book by the ton, pay per day.
                    </Text>
                    <Text style={styles.heroLoc}>{icon(0x1f4cd)} Ghana, West Africa</Text>
                    <TouchableOpacity activeOpacity={0.9} style={styles.heroBtn} onPress={() => navigation.navigate('Login')}>
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
        <Text style={styles.sectionTitle}>Featured Listings</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.seeMore}>See more</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {featured.map((f) => (
          <GlassCard key={f.id} style={styles.hCard}>
            <Image source={{ uri: f.imageUri }} style={styles.hCardImg} />
            <View style={styles.hCardBody}>
              <Text style={styles.hCardTitle} numberOfLines={1}>
                {f.name}
              </Text>
              <Text style={styles.hCardMeta} numberOfLines={1}>
                {icon(0x1f4cd)} {f.location}
              </Text>
              <Text style={styles.hCardPrice}>{f.price}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerCard: { padding: 14 },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchIcon: { fontSize: 16, marginRight: 10, color: colors.text },
  searchInput: { flex: 1, color: colors.text, fontWeight: '800' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 18, color: colors.text },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: ACCENT,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  ctaRow: { flexDirection: 'row', gap: 12, marginTop: 12 },

  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: spacing.md },
  categoryCard: { flex: 1 },
  categoryGlass: { padding: 0, overflow: 'hidden' },
  categoryBg: { height: 86, justifyContent: 'flex-end' },
  categoryBgImg: { borderRadius: 20 },
  categoryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  categoryLabel: { color: colors.text, fontWeight: '900', padding: 12 },

  heroSection: { marginTop: spacing.md },
  heroSlide: { width: '100%' },
  heroCard: { padding: 0, overflow: 'hidden' },
  hero: { height: 200, justifyContent: 'flex-end' },
  heroImg: { borderRadius: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  heroContent: { padding: 14 },
  heroTitle: { ...typography.h3, color: colors.text },
  heroSub: { marginTop: 6, color: colors.text, fontWeight: '700', opacity: 0.92, lineHeight: 18 },
  heroLoc: { marginTop: 10, color: colors.text, fontWeight: '800', opacity: 0.9 },
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
  dotInactive: { backgroundColor: 'rgba(234,240,255,0.25)' },

  sectionHeader: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.h3, color: colors.text },
  seeMore: { color: colors.danger, fontWeight: '900' },

  hList: { paddingRight: 6, marginTop: 12 },
  hCard: { width: 220, marginRight: 12, padding: 0, overflow: 'hidden' },
  hCardImg: { width: '100%', height: 110 },
  hCardBody: { padding: 14 },
  hCardTitle: { color: colors.text, fontWeight: '900' },
  hCardMeta: { marginTop: 6, color: colors.muted, fontWeight: '700' },
  hCardPrice: { marginTop: 8, color: colors.accent, fontWeight: '900' },
});

export default ExploreHomeScreen;
