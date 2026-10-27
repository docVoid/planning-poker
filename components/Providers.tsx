'use client';

import { useEffect } from 'react';
import { usePrefs } from '@/lib/prefs';

export function Providers({ children }: { children: React.ReactNode }) {
  const lang = usePrefs((s) => s.lang);
  const theme = usePrefs((s) => s.theme);

  useEffect(() => {
    void Promise.resolve(usePrefs.persist.rehydrate()).then(() => usePrefs.setState({ hydrated: true }));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-theme', theme);
  }, [lang, theme]);

  return children;
}

export function Hydrated({ children }: { children: React.ReactNode }) {
  const hydrated = usePrefs((s) => s.hydrated);
  if (!hydrated) return <div className="min-h-dvh bg-bg" aria-hidden />;
  return children;
}
