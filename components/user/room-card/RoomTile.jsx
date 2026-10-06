'use client';

import Link from 'next/link';
import { usePreferences } from '@/components/providers/Preferences';
import { formatDay, formatNumber } from '@/lib/dates';
import styles from './RoomTile.module.css';

export default function RoomTile({ room, info, checkIn, checkOut }) {
  const { t, lang } = usePreferences();
  const booked = info?.status === 'booked';
  const discount = !booked && info?.discountPercent > 0 ? info.discountPercent : 0;
  const basePrice = info?.price;
  const finalPrice = basePrice ? Math.round(basePrice * (1 - discount / 100)) : null;
  const name = lang === 'fa' ? room.name : room.nameEn;

  return (
    <article className={`${styles.tile} ${booked ? styles.booked : ''}`} data-room={room.slug}>
      <div className={styles.top}>
        <svg className={styles.arch} viewBox="0 0 40 52" aria-hidden="true">
          <path d="M4 50V20C4 9 11 3 20 3s16 6 16 17v30z" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path d="M11 50V22c0-6 4-10 9-10s9 4 9 10v28" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".55" />
        </svg>
        {discount > 0 && <span className={styles.ribbon}>{t('discountOff', { n: formatNumber(discount, lang) })}</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link className={styles.link} href={`/rooms/${room.slug}?checkIn=${checkIn}&checkOut=${checkOut}`}>{name}</Link>
        </h3>
        <p className={styles.status}>
          {booked ? t('bookedUntil', { date: formatDay(info.bookedUntil, lang) }) : t('free')}
        </p>
        {!booked && finalPrice && (
          <p className={styles.price}>
            {discount > 0 && <s>{formatNumber(basePrice, lang)}</s>}
            <strong>{formatNumber(finalPrice, lang)}</strong>
            <span>{t('currency')}</span>
          </p>
        )}
      </div>
    </article>
  );
}
