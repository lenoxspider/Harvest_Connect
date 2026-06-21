import React, { useEffect, useMemo, useState } from 'react';
import { getHomepageSettings, HomepageSettings, putHomepageSettings } from './api';

const empty: HomepageSettings = {
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

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{props.label}</label>
      <input value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder="https://..." />
    </div>
  );
}

export function App() {
  const [settings, setSettings] = useState<HomepageSettings>(empty);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'error' | 'ok'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    setStatus('loading');
    getHomepageSettings()
      .then((data) => {
        if (!mounted) return;
        setSettings(data);
        setStatus('ok');
        setMessage('Loaded from API.');
      })
      .catch((e) => {
        if (!mounted) return;
        setStatus('error');
        setMessage(String(e?.message ?? e));
      });
    return () => {
      mounted = false;
    };
  }, []);

  const previews = useMemo(
    () => [
      settings.categoryStorageImage,
      settings.categoryProduceImage,
      settings.categoryTransportImage,
      settings.categoryLogisticsImage,
      settings.heroImage1,
      settings.heroImage2,
      settings.heroImage3,
      settings.heroImage4,
      settings.featuredImage1,
      settings.featuredImage2,
      settings.featuredImage3,
    ].filter(Boolean),
    [settings]
  );

  const save = async () => {
    try {
      setStatus('saving');
      const saved = await putHomepageSettings(settings);
      setSettings(saved);
      setStatus('ok');
      setMessage('Saved. Restart Expo to see changes (or we can add live-fetch later).');
    } catch (e: any) {
      setStatus('error');
      setMessage(String(e?.message ?? e));
    }
  };

  return (
    <div className="container">
      <h1 className="title">HarvestConnect Admin</h1>
      <p className="sub">Edit homepage images (saved in Postgres via `notification-service`).</p>

      <div className="pill">
        <span>Status:</span>
        <span>{status}</span>
      </div>
      {message ? <p className="hint">{message}</p> : null}

      <div className="row">
        <div className="card">
          <h3 className="cardTitle">Homepage Images</h3>
          <div className="grid">
            <Field label="Category: Storage" value={settings.categoryStorageImage} onChange={(v) => setSettings({ ...settings, categoryStorageImage: v })} />
            <Field label="Category: Produce" value={settings.categoryProduceImage} onChange={(v) => setSettings({ ...settings, categoryProduceImage: v })} />
            <Field label="Category: Transport" value={settings.categoryTransportImage} onChange={(v) => setSettings({ ...settings, categoryTransportImage: v })} />
            <Field label="Category: Logistics" value={settings.categoryLogisticsImage} onChange={(v) => setSettings({ ...settings, categoryLogisticsImage: v })} />

            <Field label="Hero #1" value={settings.heroImage1} onChange={(v) => setSettings({ ...settings, heroImage1: v })} />
            <Field label="Hero #2" value={settings.heroImage2} onChange={(v) => setSettings({ ...settings, heroImage2: v })} />
            <Field label="Hero #3" value={settings.heroImage3} onChange={(v) => setSettings({ ...settings, heroImage3: v })} />
            <Field label="Hero #4" value={settings.heroImage4} onChange={(v) => setSettings({ ...settings, heroImage4: v })} />

            <Field label="Featured #1" value={settings.featuredImage1} onChange={(v) => setSettings({ ...settings, featuredImage1: v })} />
            <Field label="Featured #2" value={settings.featuredImage2} onChange={(v) => setSettings({ ...settings, featuredImage2: v })} />
            <Field label="Featured #3" value={settings.featuredImage3} onChange={(v) => setSettings({ ...settings, featuredImage3: v })} />
          </div>

          <div className="btnRow">
            <button className="btn btnPrimary" onClick={save} disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save'}
            </button>
          </div>

          <p className="hint">
            Use public URLs for now (e.g. Cloudinary/Drive direct links). Next step can be file upload.
          </p>
        </div>

        <div className="card">
          <h3 className="cardTitle">Preview</h3>
          <div className="previewGrid">
            {previews.length ? (
              previews.map((src, idx) => <img className="img" key={idx} src={src} alt={`preview-${idx}`} />)
            ) : (
              <p className="sub">Add URLs to see previews.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

