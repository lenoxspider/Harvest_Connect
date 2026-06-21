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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const res = await fetch(`${API_BASE_URL}/api/notifications/settings/homepage`);
  if (!res.ok) throw new Error(`GET settings failed (${res.status})`);
  return res.json();
}

export async function putHomepageSettings(payload: HomepageSettings): Promise<HomepageSettings> {
  const res = await fetch(`${API_BASE_URL}/api/notifications/settings/homepage`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PUT settings failed (${res.status})`);
  return res.json();
}

