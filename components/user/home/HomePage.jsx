'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/user/header/Header';
import RoomTile from '@/components/user/room-card/RoomTile';
import AboutSection from '@/components/user/about/AboutSection';
import FaqSection from '@/components/user/faq/FaqSection';
import { usePreferences } from '@/components/providers/Preferences';
import { rooms } from '@/lib/rooms';
import { getAvailability } from '@/lib/rooms/availability';
import DateRangeFields from '@/components/user/booking/DateRangeFields';
import { useDateRange } from '@/components/user/booking/useDateRange';
import { formatDay } from '@/lib/dates';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { t, lang } = usePreferences();
  const range = useDateRange();
  const { checkIn, checkOut, ready } = range;
  const [result, setResult] = useState({ key: '', map: {} });
  const [attempt, setAttempt] = useState(0); // the Search button asks again for the same dates
  // An answer only counts for the dates it was asked for. After a date change the cards show skeletons until the new answer
  // arrives, instead of keeping the old "free / booked" next to the new dates.
  const key = `${checkIn}|${checkOut}`;
  const fresh = ready && result.key === key;
  const loading = ready && !fresh;

  // Availability follows the dates (first load: today -> tomorrow). An older answer never overwrites a newer one.
  useEffect(() => {
    if (!ready) return undefined;
    let cancelled = false;
    getAvailability({ checkIn, checkOut }).then((list) => {
      if (!cancelled) setResult({ key: `${checkIn}|${checkOut}`, map: Object.fromEntries(list.map((item) => [item.slug, item])) });
    });
    return () => { cancelled = true; };
  }, [ready, checkIn, checkOut, attempt]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Header />
        <div className={styles.heroInner}>
          <div className={styles.copy}>
            <h1><small>{t('heroEyebrow')}</small>{t('heroTitle')}</h1>
            <p>{t('heroText')}</p>
            <p className={styles.long}>{t('heroTextLong')}</p>
          </div>
          <div className={styles.arch}>
            <Image src="/images/home/hero.png" alt={t('altHero')} fill priority sizes="(max-width: 900px) 140px, 400px" />
          </div>
        </div>
        <div className={styles.eave} aria-hidden="true" />
      </section>

      <section className={styles.search} aria-label={t('search')}>
        <DateRangeFields range={range} />
        <button type="button" className={styles.searchButton} disabled={!ready || loading} onClick={() => setAttempt((a) => a + 1)}>
          {loading ? t('searching') : t('search')}
        </button>
      </section>

      <section className={styles.rooms}>
        <div className={styles.roomsHead}>
          <h2>{t('roomsTitle')}</h2>
          {ready && <p>{t('roomsRange', { from: formatDay(checkIn, lang), to: formatDay(checkOut, lang) })}</p>}
        </div>
        <div className={styles.grid}>
          {rooms.map((room) => (
            <RoomTile key={room.slug} room={room} info={fresh ? result.map[room.slug] : undefined} checkIn={checkIn} checkOut={checkOut} />
          ))}
        </div>
      </section>

      <FaqSection />
      <AboutSection />
    </main>
  );
}
