'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/user/header/Header';
import { usePreferences } from '@/components/providers/Preferences';
import { CONTACT } from '@/lib/contact';
import styles from './BookingDone.module.css';

// Result of the payment (see app/booking/done/page.jsx for how the outcome is decided).
const VIEW = {
  paid: { tone: 'ok', icon: 'check', title: 'donePaidTitle', text: 'donePaidText', code: true },
  saved: { tone: 'wait', icon: 'check', title: 'doneSavedTitle', text: 'doneSavedText', code: true },
  unconfirmed: { tone: 'wait', icon: 'clock', title: 'doneUnconfirmedTitle', text: 'doneUnconfirmedText', code: true },
  cancelled: { tone: 'bad', icon: 'cross', title: 'doneCancelledTitle', text: 'doneCancelledText', code: false },
  failed: { tone: 'bad', icon: 'cross', title: 'doneFailedTitle', text: 'doneFailedText', code: false },
};

const ICONS = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  cross: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
};

export default function BookingDone({ code, outcome = 'failed' }) {
  const { t } = usePreferences();
  const view = VIEW[outcome] || VIEW.failed;
  const needsSupport = outcome !== 'paid';

  // The unfinished-payment reminder is only for an unclear payment. Once the result is final it must go away.
  useEffect(() => {
    if (outcome === 'paid' || outcome === 'cancelled' || outcome === 'failed') {
      try { localStorage.removeItem('bn-pending-payment'); } catch { /* storage may be blocked: nothing to clean */ }
    }
  }, [outcome]);

  return (
    <main className={styles.page}>
      <Header solid />
      <section className={styles.card} role="status" aria-live="polite">
        <span className={styles.badge} data-tone={view.tone} aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{ICONS[view.icon]}</svg>
        </span>
        <h1>{t(view.title)}</h1>
        <p className={styles.text}>{t(view.text)}</p>
        {view.code && code && <div className={styles.code}><span>{t('doneCode')}</span><strong dir="ltr">{code}</strong></div>}
        <div className={styles.buttons}>
          {outcome === 'paid' && <Link className={styles.primary} href="/my-reservations">{t('navMyReservations')}</Link>}
          {(outcome === 'cancelled' || outcome === 'failed') && <Link className={styles.primary} href="/rooms">{t('doneTryAgain')}</Link>}
          {(outcome === 'saved' || outcome === 'unconfirmed') && <a className={styles.primary} href={`tel:${CONTACT.tel}`}>{t('supportCall')}</a>}
          {(outcome === 'cancelled' || outcome === 'failed') && <a className={styles.ghost} href={`tel:${CONTACT.tel}`}>{t('supportCall')}</a>}
          {(outcome === 'saved' || outcome === 'unconfirmed') && <Link className={styles.ghost} href="/my-reservations">{t('navMyReservations')}</Link>}
          <Link className={styles.ghost} href="/">{t('navHome')}</Link>
        </div>
      </section>
    </main>
  );
}
