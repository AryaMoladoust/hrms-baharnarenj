'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translate } from '@/lib/i18n';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children, initialLang = 'fa' }) {
  const [lang, setLang] = useState(initialLang);

  const toggleLang = useCallback(() => {
    const next = lang === 'fa' ? 'en' : 'fa';
    const root = document.documentElement;
    root.lang = next;
    root.dir = next === 'fa' ? 'rtl' : 'ltr';
    document.cookie = `bn-lang=${next}; path=/; max-age=31536000; samesite=lax`; // read by app/layout.jsx on the next request
    setLang(next);
  }, [lang]);

  const value = useMemo(
    () => ({ lang, toggleLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang, toggleLang],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
}
