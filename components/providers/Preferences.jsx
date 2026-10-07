'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translate } from '@/lib/i18n';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [lang, setLang] = useState('fa');

  // The inline script in layout.jsx already set lang/dir before first paint; mirror it into state.
  useEffect(() => {
    setLang(document.documentElement.lang === 'en' ? 'en' : 'fa');
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === 'fa' ? 'en' : 'fa';
    const root = document.documentElement;
    root.lang = next;
    root.dir = next === 'fa' ? 'rtl' : 'ltr';
    try { localStorage.setItem('bn-lang', next); } catch {}
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
