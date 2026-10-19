'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePreferences } from '@/components/providers/Preferences';
import { ApiError, ownerFetch } from '@/lib/owner/client';
import styles from './LoginView.module.css';

const EYE = <><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>;
const EYE_OFF = <><path d="M3 3l18 18" /><path d="M10.6 5.7A10.4 10.4 0 0112 5.5C18.4 5.5 22 12 22 12a17.6 17.6 0 01-3.1 3.9M6.6 6.7A17.2 17.2 0 002 12s3.6 6.5 10 6.5c1.7 0 3.2-.4 4.5-1" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></>;
const eyeIcon = (paths) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);

export default function LoginView() {
  const { t, toggleLang } = usePreferences();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.username.trim() || !form.password) { setError(t('ownErrInvalid')); return; }
    setBusy(true);
    setError('');
    try {
      await ownerFetch('login', { method: 'POST', body: form });
      router.replace('/owner/dashboard');
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.code === 'locked') setError(t('ownErrLocked'));
      else if (e instanceof ApiError && e.code === 'too_many') setError(t('ownErrTooMany'));
      else if (e instanceof ApiError && e.code === 'invalid') setError(t('ownErrInvalid'));
      else if (e instanceof ApiError && e.code === 'db_unavailable') setError(t('ownErrDb'));
      else setError(t('ownErrServer'));
      setBusy(false);
    }
  };

  return (
    <main className={styles.page}>
      <button type="button" className={styles.lang} onClick={toggleLang}>{t('langShort')}</button>
      <section className={styles.card}>
        <svg className={styles.arch} viewBox="0 0 40 52" aria-hidden="true">
          <path d="M4 50V20C4 9 11 3 20 3s16 6 16 17v30z" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path d="M11 50V22c0-6 4-10 9-10s9 4 9 10v28" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".55" />
        </svg>
        <h1>{t('ownLoginTitle')}</h1>
        <p>{t('ownLoginSubtitle')}</p>

        <form className={styles.form} onSubmit={submit} noValidate>
          <label>
            <span>{t('ownUsername')}</span>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" autoCapitalize="none" autoCorrect="off" dir="ltr" />
          </label>
          <label>
            <span>{t('ownPassword')}</span>
            <div className={styles.passwordRow} dir="ltr">
              <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" dir="ltr" />
              <button type="button" onClick={() => setShow(!show)} aria-pressed={show} aria-label={show ? t('ownHide') : t('ownShow')} title={show ? t('ownHide') : t('ownShow')}>{eyeIcon(show ? EYE_OFF : EYE)}</button>
            </div>
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.submit} disabled={busy}>{busy ? t('ownLoggingIn') : t('ownLogin')}</button>
        </form>
        <a className={styles.back} href="/">{t('ownBackToSite')}</a>
      </section>
    </main>
  );
}
