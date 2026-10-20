'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/user/header/Header';
import RoomTile from '@/components/user/room-card/RoomTile';
import DateRangeFields from '@/components/user/booking/DateRangeFields';
import { useDateRange } from '@/components/user/booking/useDateRange';
import { usePreferences } from '@/components/providers/Preferences';
import { rooms } from '@/lib/rooms';
import { getAvailability } from '@/lib/rooms/availability';
import styles from './RoomsList.module.css';

export default function RoomsList() {
  const { t } = usePreferences();
  const range = useDateRange();
  const [result, setResult] = useState({ key: '', map: {} });
  // The answer only counts for the dates it was asked for; after a date change the cards show skeletons until the new one arrives.
  const key = `${range.checkIn}|${range.checkOut}`;
  const fresh = range.ready && result.key === key;

  // Availability follows the chosen dates.
  useEffect(() => {
    if (!range.ready) return undefined;
    let cancelled = false;
    const asked = `${range.checkIn}|${range.checkOut}`;
    getAvailability({ checkIn: range.checkIn, checkOut: range.checkOut }).then((list) => {
      if (!cancelled) setResult({ key: asked, map: Object.fromEntries(list.map((item) => [item.slug, item])) });
    });
    return () => { cancelled = true; };
  }, [range.ready, range.checkIn, range.checkOut]);

  return (
    <main className={styles.page}>
      <Header solid />
      <div className={styles.inner}>
        <h1>{t('roomsPageTitle')}</h1>
        <div className={styles.dates}><DateRangeFields range={range} /></div>
        <div className={styles.grid}>
          {rooms.map((room) => (
            <RoomTile key={room.slug} room={room} info={fresh ? result.map[room.slug] : undefined} checkIn={range.checkIn} checkOut={range.checkOut} />
          ))}
        </div>
      </div>
    </main>
  );
}
