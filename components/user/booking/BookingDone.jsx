'use client';

import Link from 'next/link';
import Header from '@/components/user/header/Header';
import { usePreferences } from '@/components/providers/Preferences';
import { CONTACT } from '@/lib/contact';
import styles from './BookingDone.module.css';

// Shown after the booking is saved. Paid = confirmed. Not paid = the booking is saved and held, but online payment is not connected yet.
export default function BookingDone({ code, pending }) {
  const { t } = usePreferences();
  return (
    <main className={styles.page}>
      <Header solid />
      <section className={styles.card}>
        <span className={styles.badge} data-pending={pending} aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <h1>{pending ? t('doneSavedTitle') : t('donePaidTitle')}</h1>
        <p className={styles.text}>{pending ? t('doneSavedText') : t('donePaidText')}</p>
        <div className={styles.code}><span>{t('doneCode')}</span><strong dir="ltr">{code}</strong></div>
        <div className={styles.buttons}>
          {pending && <a className={styles.primary} href={`tel:${CONTACT.tel}`}>{t('supportCall')}</a>}
          <Link className={pending ? styles.ghost : styles.primary} href="/my-reservations">{t('navMyReservations')}</Link>
          <Link className={styles.ghost} href="/">{t('navHome')}</Link>
        </div>
      </section>
    </main>
  );
}
