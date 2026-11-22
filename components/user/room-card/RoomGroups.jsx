'use client';

import RoomTile from '@/components/user/room-card/RoomTile';
import { usePreferences } from '@/components/providers/Preferences';
import { rooms } from '@/lib/rooms';
import styles from './RoomGroups.module.css';

// The four seasonal rooms are one group; the suite is a separate unit and is shown apart, under its own labelled divider.
const seasonal = rooms.filter((room) => room.slug !== 'suite');
const suite = rooms.filter((room) => room.slug === 'suite');

/**
 * All five units for the home page and the rooms page.
 * infoMap = availability answer by room slug (undefined while it loads -> the cards show skeletons).
 */
export default function RoomGroups({ infoMap, checkIn, checkOut }) {
  const { t } = usePreferences();
  const tile = (room) => <RoomTile key={room.slug} room={room} info={infoMap?.[room.slug]} checkIn={checkIn} checkOut={checkOut} />;

  return (
    <div className={styles.groups}>
      <section aria-label={t('roomsSeasonalTitle')}>
        <div className={styles.head}>
          <p className={styles.title}>{t('roomsSeasonalTitle')}</p>
          <p className={styles.text}>{t('roomsSeasonalText')}</p>
        </div>
        <div className={styles.grid}>{seasonal.map(tile)}</div>
      </section>

      <div className={styles.divider} role="separator"><span>{t('roomsSuiteDivider')}</span></div>

      <section aria-label={t('roomsSuiteDivider')}>
        <div className={styles.grid}>{suite.map(tile)}</div>
      </section>
    </div>
  );
}
