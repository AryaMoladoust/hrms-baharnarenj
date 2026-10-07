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
  const [availability, setAvailability] = useState({});

  // Availability follows the chosen dates.
  useEffect(() => {
    if (!range.ready) return undefined;
    let cancelled = false;
    getAvailability({ checkIn: range.checkIn, checkOut: range.checkOut }).then((list) => {
      if (!cancelled) setAvailability(Object.fromEntries(list.map((item) => [item.slug, item])));
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
            <RoomTile key={room.slug} room={room} info={availability[room.slug]} checkIn={range.checkIn} checkOut={range.checkOut} />
          ))}
        </div>
      </div>
    </main>
  );
}
