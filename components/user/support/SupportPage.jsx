'use client';

import Header from '@/components/user/header/Header';
import SupportCard from '@/components/user/support/SupportCard';
import { usePreferences } from '@/components/providers/Preferences';
import styles from './SupportPage.module.css';

// All the support / contact details live here (the side menu only links to this page). The details themselves are in lib/contact.js.
export default function SupportPage() {
  const { t } = usePreferences();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Header />
        <div className={styles.heroInner}>
          <h1>{t('supportTitle')}</h1>
          <p>{t('supportIntro')}</p>
        </div>
        <div className={styles.eave} aria-hidden="true" />
      </section>

      <div className={styles.content}>
        <SupportCard variant="light" />
      </div>
    </main>
  );
}
