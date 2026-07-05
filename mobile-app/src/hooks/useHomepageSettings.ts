import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomepageSettings, settingsApi } from '../api/settingsApi';

const CACHE_KEY = 'homepage_settings_v1';

const defaults: HomepageSettings = {
  categoryStorageImage: '',
  categoryProduceImage: '',
  categoryTransportImage: '',
  categoryLogisticsImage: '',

  heroImage1: '',
  heroImage2: '',
  heroImage3: '',
  heroImage4: '',

  featuredImage1: '',
  featuredImage2: '',
  featuredImage3: '',
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

