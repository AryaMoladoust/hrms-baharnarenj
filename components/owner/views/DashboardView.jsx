'use client';

import Link from 'next/link';
import OwnerShell, { useOwner } from '@/components/owner/OwnerShell';
import ReservationRow from '@/components/owner/ReservationRow';
import { Card, Chip, Empty, ErrorNote, icon, Loading, RoomDot } from '@/components/owner/ui/Kit';
import { useOwnerData } from '@/components/owner/useOwnerData';
import { day, money, roomName } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { formatNumber } from '@/lib/dates';
import { rooms } from '@/lib/rooms';
import styles from './DashboardView.module.css';

function StateChip({ room, t, lang }) {
  if (room.blocked) return <Chip tone="muted">{t('ownRoomBlocked')}</Chip>;
  if (room.state === 'occupied') return <Chip tone="bad">{t('ownRoomUntil', { date: day(room.until, lang) })}</Chip>;
  if (room.arriving) return <Chip tone="warn">{t('ownRoomArriving')}</Chip>;
  return <Chip tone="ok">{t('free')}</Chip>;
}

function PeopleList({ title, list, tone, emptyText, onOpen }) {
  const { t, lang } = usePreferences();
  return (
    <Card title={title} action={<Chip tone={tone}>{formatNumber(list.length, lang)}</Chip>}>
      {list.length === 0 ? <Empty>{emptyText}</Empty> : (
        <ul className={styles.people}>
          {list.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => onOpen(r.id)}>
                <span><RoomDot slug={r.roomSlug} /> <strong>{r.guestName || '—'}</strong></span>
                <span>{roomName(r.roomSlug, lang)} · {t('guestsShort', { n: formatNumber(r.guests, lang) })}</span>
              </button>
              {r.mobile && <a href={`tel:${r.mobile}`} className={styles.call} aria-label={t('ownCall')}>{icon(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />, 20)}</a>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Body() {
  const { t, lang } = usePreferences();
  const { owner } = useOwner();
  const { data, error, loading, reload } = useOwnerData('dashboard');
  const open = (id) => { window.location.href = `/owner/reservations?open=${id}`; };

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorNote onRetry={reload} retryLabel={t('ownRetry')}>{t('ownErrServer')}</ErrorNote>;

  const percent = Math.round((data.occupied / data.totalRooms) * 100);
  const peak = Math.max(1, ...data.month.series.map((s) => Math.max(s.income, 0)));

  return (
    <>
      <Card tone="night" className={styles.hero}>
        <div className={styles.heroText}>
          <span>{t('ownHello', { name: owner?.displayName || '' })}</span>
          <h2>{day(data.today, lang, true)}</h2>
          <p>{t('ownTonight', { n: formatNumber(data.occupied, lang), total: formatNumber(data.totalRooms, lang) })}</p>
        </div>
        <div className={styles.ring} style={{ '--p': percent }} aria-hidden="true"><b>{formatNumber(data.occupied, lang)}<small>/{formatNumber(data.totalRooms, lang)}</small></b></div>
        <div className={styles.actions}>
          <Link href="/owner/reservations?new=1">{icon(<path d="M12 5v14M5 12h14" />, 18)} {t('ownNewBooking')}</Link>
          <Link href="/owner/finance?add=1">{icon(<path d="M12 5v14M5 12h14" />, 18)} {t('ownAddExpense')}</Link>
        </div>
      </Card>

      <Card title={t('ownRoomsToday')} action={<Link href="/owner/rooms" className={styles.more}>{t('ownCalendar')}</Link>}>
        <ul className={styles.rooms}>
          {data.rooms.map((room) => (
            <li key={room.slug}>
              <span><RoomDot slug={room.slug} /> <strong>{roomName(room.slug, lang)}</strong></span>
              <span className={styles.roomState}>
                <StateChip room={room} t={t} lang={lang} />
                {room.departing && room.state !== 'occupied' && <Chip tone="info">{t('ownRoomDeparting')}</Chip>}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <PeopleList title={t('ownArrivalsToday')} list={data.arrivals} tone="warn" emptyText={t('ownNoArrivals')} onOpen={open} />
      <PeopleList title={t('ownDeparturesToday')} list={data.departures} tone="info" emptyText={t('ownNoDepartures')} onOpen={open} />

      {data.upcoming.length > 0 && (
        <Card title={t('ownNext7')}>
          <div className={styles.list}>{data.upcoming.map((r) => <ReservationRow key={r.id} r={r} onOpen={open} />)}</div>
        </Card>
      )}

      <Card tone="night" title={t('ownThisMonth')} iconNode={icon(<path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />, 20)} action={<Link href="/owner/finance" className={styles.moreLight}>{t('ownReports')}</Link>}>
        <dl className={styles.money}>
          <div><dt>{t('ownIncome')}</dt><dd>{money(data.month.income, lang, t)}</dd></div>
          <div><dt>{t('ownExpense')}</dt><dd>{money(data.month.expense, lang, t)}</dd></div>
          <div className={styles.net}><dt>{t('ownNet')}</dt><dd data-negative={data.month.net < 0}>{money(data.month.net, lang, t)}</dd></div>
        </dl>
        <div className={styles.bars} aria-hidden="true">
          {data.month.series.map((s) => <i key={s.key} className={s.key === data.today ? styles.barToday : undefined} style={{ height: `${Math.max(4, (Math.max(s.income, 0) / peak) * 100)}%` }} />)}
        </div>
      </Card>

      <Card title={t('ownRecent')} action={<Link href="/owner/reservations" className={styles.more}>{t('ownAll')}</Link>}>
        {data.recent.length === 0 ? <Empty>{t('ownNoReservations')}</Empty> : (
          <div className={styles.list}>{data.recent.map((r) => <ReservationRow key={r.id} r={r} onOpen={open} showCreated />)}</div>
        )}
      </Card>
    </>
  );
}

export default function DashboardView() {
  const { t } = usePreferences();
  return <OwnerShell title={t('ownNavDashboard')}><Body /></OwnerShell>;
}
