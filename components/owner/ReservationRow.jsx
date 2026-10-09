'use client';

import { Chip, RoomDot } from '@/components/owner/ui/Kit';
import { day, money, roomName, STATUS } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { nightsBetween } from '@/lib/dates';
import styles from './ReservationRow.module.css';

// One reservation as a tappable row: room color, guest, dates, status and amount.
export default function ReservationRow({ r, onOpen, showCreated }) {
  const { t, lang } = usePreferences();
  const [statusKey, tone] = STATUS[r.status] || STATUS.pending;
  const guestName = r.guestName ?? r.guest?.fullName ?? '';
  const total = r.total ?? r.pricing?.total ?? 0;
  const blocked = r.status === 'blocked';
  const nights = nightsBetween(r.checkIn, r.checkOut);

  return (
    <button type="button" className={styles.row} onClick={() => onOpen(r.id)} data-room={r.roomSlug} data-status={r.status}>
      <span className={styles.stripe} aria-hidden="true" />
      <span className={styles.main}>
        <strong><RoomDot slug={r.roomSlug} /> {roomName(r.roomSlug, lang)}{!blocked && guestName ? ` · ${guestName}` : ''}</strong>
        <span className={styles.dates}>{day(r.checkIn, lang)} – {day(r.checkOut, lang)} · {t('nights', { n: nights })}</span>
        <span className={styles.meta}>
          <Chip tone={tone}>{t(statusKey)}</Chip>
          {r.source === 'manual' && <Chip tone="info">{t('ownSourceManual')}</Chip>}
          {showCreated && r.source === 'online' && <Chip tone="info">{t('ownSourceOnline')}</Chip>}
        </span>
      </span>
      {!blocked && <span className={styles.amount}>{money(total, lang, t)}</span>}
    </button>
  );
}
