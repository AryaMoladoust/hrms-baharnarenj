'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translate } from '@/lib/i18n';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('fa');

  // The inline script in layout.jsx already set the attributes before first paint; mirror them into state.
  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
    setLang(root.lang === 'en' ? 'en' : 'fa');
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('bn-theme', next); } catch {}
    setTheme(next);
  }, [theme]);

  const toggleLang = useCallback(() => {
    const next = lang === 'fa' ? 'en' : 'fa';
    const root = document.documentElement;
    root.lang = next;
    root.dir = next === 'fa' ? 'rtl' : 'ltr';
    try { localStorage.setItem('bn-lang', next); } catch {}
    setLang(next);
  }, [lang]);

  const value = useMemo(
    () => ({ theme, lang, toggleTheme, toggleLang, t: (key, vars) => translate(lang, key, vars) }),
    [theme, lang, toggleTheme, toggleLang],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
}
