'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/user/header/Header';
import RoomTile from '@/components/user/room-card/RoomTile';
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
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const searched = useRef(false);

  const search = useCallback(async (from, to) => {
    setLoading(true);
    const result = await getAvailability({ checkIn: from, checkOut: to });
    setAvailability(Object.fromEntries(result.map((item) => [item.slug, item])));
    setLoading(false);
  }, []);

  // First load: show availability for the default range (today -> tomorrow).
  useEffect(() => {
    if (ready && !searched.current) {
      searched.current = true;
      search(checkIn, checkOut);
    }
  }, [ready, checkIn, checkOut, search]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Header />
        <div className={styles.heroInner}>
          <div className={styles.arch}>
            <Image src="/images/home/hero.png" alt="" fill priority sizes="(max-width: 900px) 80vw, 420px" />
          </div>
          <div className={styles.copy}>
            <h1>{t('heroTitle')}</h1>
            <p>{t('heroText')}</p>
          </div>
        </div>
        <div className={styles.eave} aria-hidden="true" />
      </section>

      <section className={styles.search} aria-label={t('search')}>
        <DateRangeFields range={range} />
        <button type="button" className={styles.searchButton} disabled={!ready || loading} onClick={() => search(checkIn, checkOut)}>
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
            <RoomTile key={room.slug} room={room} info={availability[room.slug]} checkIn={checkIn} checkOut={checkOut} />
          ))}
        </div>
      </section>
    </main>
  );
}
