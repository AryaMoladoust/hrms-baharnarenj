'use client';

import { useState } from 'react';
import OwnerShell from '@/components/owner/OwnerShell';
import ReservationSheet from '@/components/owner/ReservationSheet';
import ManualReservationSheet from '@/components/owner/ManualReservationSheet';
import { Button, Card, Chip, ErrorNote, Loading, RoomDot } from '@/components/owner/ui/Kit';
import { useOwnerData } from '@/components/owner/useOwnerData';
import { day, range as dateRange, roomName } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { partsOf } from '@/lib/calendar';
import { addDays, formatNumber } from '@/lib/dates';
import styles from './RoomsView.module.css';

const WEEKDAY = { fa: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'], en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] }; // Sunday first, like Date.getDay()
const DAYS = 14;

function Body() {
  const { t, lang } = usePreferences();
  const [from, setFrom] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [manual, setManual] = useState(null);
  const { data, error, loading, reload } = useOwnerData(`rooms?days=${DAYS}${from ? `&from=${from}` : ''}`);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorNote onRetry={reload} retryLabel={t('ownRetry')}>{t('ownErrServer')}</ErrorNote>;

  const first = data.days[0];
  const last = data.days[data.days.length - 1];
  const dow = (iso) => new Date(`${iso}T12:00:00`).getDay();
  const nameOf = (slug) => roomName(slug, lang);

  return (
    <>
      <Card title={t('ownRoomsToday')}>
        <ul className={styles.cards}>
          {data.rooms.map((room) => (
            <li key={room.slug} className={styles.roomCard} data-room={room.slug}>
              <div className={styles.cardTop}>
                <strong><RoomDot slug={room.slug} /> {nameOf(room.slug)}</strong>
                {room.current?.kind === 'block' ? <Chip tone="muted">{t('ownRoomBlocked')}</Chip> : room.state === 'occupied' ? <Chip tone="bad">{t('ownRoomOccupied')}</Chip> : room.arriving ? <Chip tone="warn">{t('ownRoomArriving')}</Chip> : <Chip tone="ok">{t('free')}</Chip>}
              </div>
              {room.current && (
                <button type="button" className={styles.link} onClick={() => setOpenId(room.current.id)}>
                  {room.current.kind === 'block' ? (room.current.note || t('ownRoomBlocked')) : room.current.guestName || '—'} · {t('ownRoomUntil', { date: day(room.current.checkOut, lang) })}
                </button>
              )}
              {room.next && (
                <button type="button" className={styles.linkSoft} onClick={() => setOpenId(room.next.id)}>
                  {t('ownNextBooking')}: {room.next.kind === 'block' ? t('ownRoomBlocked') : room.next.guestName} · {day(room.next.checkIn, lang)}
                </button>
              )}
              <div className={styles.cardActions}>
                <Button variant="ghost" onClick={() => setManual({ mode: 'booking', slug: room.slug })}>{t('ownNewBooking')}</Button>
                <Button variant="ghost" onClick={() => setManual({ mode: 'block', slug: room.slug })}>{t('ownBlockDates')}</Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title={t('ownCalendar')} action={
        <div className={styles.nav}>
          <button type="button" onClick={() => setFrom(addDays(first, -DAYS))} aria-label={t('prevMonth')}>‹</button>
          <button type="button" onClick={() => setFrom(null)}>{t('goToday')}</button>
          <button type="button" onClick={() => setFrom(addDays(first, DAYS))} aria-label={t('nextMonth')}>›</button>
        </div>
      }>
        <p className={styles.range}>{dateRange(first, last, lang)}</p>
        <div className={styles.scroller}>
          <div className={styles.grid} style={{ '--days': data.days.length }}>
            <span className={styles.corner} />
            {data.days.map((iso) => {
              const jd = partsOf(iso, 'jalali');
              return (
                <span key={iso} className={styles.dayHead} data-today={iso === data.today} data-friday={dow(iso) === 5}>
                  <small>{WEEKDAY[lang][dow(iso)]}</small>{formatNumber(jd.d, lang)}
                </span>
              );
            })}
            {data.timeline.map((row) => (
              <div key={row.slug} className={styles.row} data-room={row.slug}>
                <span className={styles.roomName}><RoomDot slug={row.slug} /> {nameOf(row.slug)}</span>
                {row.cells.map((cell) => {
                  const res = cell.res;
                  if (!res) {
                    return <button key={cell.iso} type="button" className={styles.empty} aria-label={`${nameOf(row.slug)} ${day(cell.iso, lang)}`} onClick={() => setManual({ mode: 'booking', slug: row.slug, checkIn: cell.iso, checkOut: addDays(cell.iso, 1) })} />;
                  }
                  return (
                    <button key={cell.iso} type="button" className={styles.busy} data-kind={res.kind} data-status={res.status} data-first={res.first} data-last={res.last} onClick={() => setOpenId(res.id)} aria-label={`${nameOf(row.slug)} ${res.guestName}`}>
                      {res.first && <span>{res.kind === 'block' ? '⛔' : res.guestName.split(' ')[0]}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className={styles.legend}><i data-k="paid" /> {t('statusPaid')} <i data-k="pending" /> {t('statusPending')} <i data-k="blocked" /> {t('ownStatusBlocked')} · {t('ownTapEmpty')}</p>
      </Card>

      <ReservationSheet id={openId} onClose={() => setOpenId(null)} onChanged={reload} />
      <ManualReservationSheet open={Boolean(manual)} initial={manual || undefined} onClose={() => setManual(null)} onCreated={reload} />
    </>
  );
}

export default function RoomsView() {
  const { t } = usePreferences();
  return <OwnerShell title={t('ownNavRooms')}><Body /></OwnerShell>;
}
