import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomepageSettings, settingsApi } from '../api/settingsApi';

const CACHE_KEY = 'homepage_settings_v1';

const defaults: HomepageSettings = {
  categoryStorageImage: 'https://picsum.photos/400/300?random=71',
  categoryProduceImage: 'https://picsum.photos/400/300?random=72',
  categoryTransportImage: 'https://picsum.photos/400/300?random=73',
  categoryLogisticsImage: 'https://picsum.photos/400/300?random=74',

  heroImage1: 'https://picsum.photos/800/450?random=81',
  heroImage2: 'https://picsum.photos/800/450?random=82',
  heroImage3: 'https://picsum.photos/800/450?random=83',
  heroImage4: 'https://picsum.photos/800/450?random=84',

  featuredImage1: 'https://picsum.photos/400/300?random=91',
  featuredImage2: 'https://picsum.photos/400/300?random=92',
  featuredImage3: 'https://picsum.photos/400/300?random=93',
};

export function useHomepageSettings() {
  const [settings, setSettings] = useState<HomepageSettings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && mounted) {
          setSettings({ ...defaults, ...(JSON.parse(cached) as Partial<HomepageSettings>) });
        }
      } catch {}

      try {
        const fresh = await settingsApi.getHomepageSettings();
        if (!mounted) return;
        setSettings({ ...defaults, ...fresh });
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
      } catch {
        // keep cached/defaults
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { settings, loading };
}

