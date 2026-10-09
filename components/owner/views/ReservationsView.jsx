'use client';

import { useEffect, useState } from 'react';
import OwnerShell from '@/components/owner/OwnerShell';
import ReservationRow from '@/components/owner/ReservationRow';
import ReservationSheet from '@/components/owner/ReservationSheet';
import ManualReservationSheet from '@/components/owner/ManualReservationSheet';
import { Empty, ErrorNote, Loading, Segmented } from '@/components/owner/ui/Kit';
import { useOwnerData } from '@/components/owner/useOwnerData';
import { usePreferences } from '@/components/providers/Preferences';
import styles from './ReservationsView.module.css';

const STATUS_OPTIONS = [['', 'ownAllStatuses'], ['paid', 'statusPaid'], ['pending', 'statusPending'], ['cancelled', 'statusCancelled'], ['blocked', 'ownStatusBlocked']];

function Body() {
  const { t } = usePreferences();
  const [when, setWhen] = useState('upcoming');
  const [status, setStatus] = useState('');
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const [manual, setManual] = useState(null); // null | { mode, slug, checkIn }

  // ?new=1 opens the booking form, ?open=<id> a reservation, ?q=<code> pre-fills the search (links from other pages and notifications)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new')) setManual({ mode: 'booking' });
    if (params.get('open')) setOpenId(params.get('open'));
    if (params.get('q')) { setText(params.get('q')); setQ(params.get('q')); setWhen('all'); }
  }, []);
  useEffect(() => { const id = setTimeout(() => setQ(text.trim()), 350); return () => clearTimeout(id); }, [text]);

  const query = new URLSearchParams({ ...(when !== 'all' ? { when } : {}), ...(status ? { status } : {}), ...(q ? { q } : {}) }).toString();
  const { data, error, loading, reload } = useOwnerData(`reservations${query ? `?${query}` : ''}`);

  return (
    <>
      <div className={styles.tools}>
        <Segmented value={when} onChange={setWhen} ariaLabel={t('ownNavReservations')} options={[{ value: 'upcoming', label: t('ownWhenUpcoming') }, { value: 'today', label: t('ownWhenToday') }, { value: 'past', label: t('ownWhenPast') }, { value: 'all', label: t('ownAll') }]} />
        <div className={styles.chips} role="group" aria-label={t('ownStatus')}>
          {STATUS_OPTIONS.map(([value, key]) => (
            <button key={value} type="button" className={status === value ? styles.chipOn : styles.chip} onClick={() => setStatus(value)}>{t(key)}</button>
          ))}
        </div>
        <input className={styles.search} type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('ownSearchPlaceholder')} aria-label={t('ownSearchPlaceholder')} />
      </div>

      {loading && !data && <Loading />}
      {error && !data && <ErrorNote onRetry={reload} retryLabel={t('ownRetry')}>{t('ownErrServer')}</ErrorNote>}
      {data && (data.reservations.length === 0 ? <Empty>{t('ownNoReservations')}</Empty> : (
        <div className={styles.list}>{data.reservations.map((r) => <ReservationRow key={r.id} r={r} onOpen={setOpenId} showCreated />)}</div>
      ))}

      <button type="button" className={styles.fab} onClick={() => setManual({ mode: 'booking' })} aria-label={t('ownNewBooking')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      <ReservationSheet id={openId} onClose={() => setOpenId(null)} onChanged={reload} />
      <ManualReservationSheet open={Boolean(manual)} initial={manual || undefined} onClose={() => setManual(null)} onCreated={reload} />
    </>
  );
}

export default function ReservationsView() {
  const { t } = usePreferences();
  return <OwnerShell title={t('ownNavReservations')}><Body /></OwnerShell>;
}
