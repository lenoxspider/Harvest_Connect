import axiosInstance from './axios';

export type HomepageSettings = {
  categoryStorageImage: string;
  categoryProduceImage: string;
  categoryTransportImage: string;
  categoryLogisticsImage: string;

  heroImage1: string;
  heroImage2: string;
  heroImage3: string;
  heroImage4: string;

  featuredImage1: string;
  featuredImage2: string;
  featuredImage3: string;
};

export const settingsApi = {
  getHomepageSettings: async (): Promise<HomepageSettings> => {
    const res = await axiosInstance.get('/api/notifications/settings/homepage');
    return res.data;
  },
};

