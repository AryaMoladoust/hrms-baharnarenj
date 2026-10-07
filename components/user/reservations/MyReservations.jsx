'use client';

import { useState } from 'react';
import Header from '@/components/user/header/Header';
import { usePreferences } from '@/components/providers/Preferences';
import { getRoomBySlug } from '@/lib/rooms';
import { lookupReservations } from '@/lib/reservations/lookup';
import { isValidNationalId, normalizeDigits } from '@/lib/booking/validation';
import { formatDay, formatNumber, nightsBetween } from '@/lib/dates';
import styles from './MyReservations.module.css';

const STATUS_KEYS = { paid: 'statusPaid', pending: 'statusPending', cancelled: 'statusCancelled' };

export default function MyReservations() {
  const { t, lang } = usePreferences();
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ phase: 'idle', items: [] });

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (fullName.trim().length < 3) next.fullName = t('errName');
    if (!isValidNationalId(nationalId)) next.nationalId = t('errNationalId');
    setErrors(next);
    if (Object.keys(next).length) return;

    setState({ phase: 'loading', items: [] });
    const items = await lookupReservations({ fullName: fullName.trim(), nationalId: normalizeDigits(nationalId) });
    setState({ phase: 'done', items });
  };

  return (
    <main className={styles.page}>
      <Header solid />
      <div className={styles.inner}>
        <h1>{t('myTitle')}</h1>
        <p className={styles.intro}>{t('myIntro')}</p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <label className={styles.field}>
            <span>{t('fullName')}</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.fullName)} />
            {errors.fullName && <em role="alert">{errors.fullName}</em>}
          </label>
          <label className={styles.field}>
            <span>{t('nationalId')}</span>
            <input value={nationalId} onChange={(event) => setNationalId(event.target.value)} inputMode="numeric" dir="ltr" maxLength={10} aria-invalid={Boolean(errors.nationalId)} />
            {errors.nationalId && <em role="alert">{errors.nationalId}</em>}
          </label>
          <button type="submit" className={styles.submit} disabled={state.phase === 'loading'}>
            {state.phase === 'loading' ? t('myFinding') : t('myFind')}
          </button>
        </form>

        {state.phase === 'done' && state.items.length === 0 && <p className={styles.empty}>{t('myEmpty')}</p>}

        <ul className={styles.list}>
          {state.items.map((item) => {
            const room = getRoomBySlug(item.roomSlug);
            return (
              <li key={item.id} className={styles.card} data-room={item.roomSlug}>
                <div className={styles.cardTop}>
                  <strong>{lang === 'fa' ? room?.name : room?.nameEn}</strong>
                  <span className={styles[`status_${item.status}`]}>{t(STATUS_KEYS[item.status])}</span>
                </div>
                <p>{formatDay(item.checkIn, lang)} – {formatDay(item.checkOut, lang)}، {t('nights', { n: formatNumber(nightsBetween(item.checkIn, item.checkOut), lang) })}</p>
                <p className={styles.meta}>{t('guestsShort', { n: formatNumber(item.guests, lang) })} · {formatNumber(item.total, lang)} {t('currency')}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
