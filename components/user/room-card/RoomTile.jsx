'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePreferences } from '@/components/providers/Preferences';
import { formatDay, formatNumber } from '@/lib/dates';
import styles from './RoomTile.module.css';

/**
 * Room card: the room's first photo in an arched "window" ringed in the room's season color, with name, status and price below.
 * When the photo file is missing (e.g. the suite, until its photos are added) the arch shows a patterned season-colored placeholder.
 * The suite card is wide (full row); the other four sit two per row. Colors and layout live in RoomTile.module.css.
 */
export default function RoomTile({ room, info, checkIn, checkOut }) {
  const { t, lang } = usePreferences();
  const [coverMissing, setCoverMissing] = useState(false);
  const booked = info?.status === 'booked';
  const discount = !booked && info?.discountPercent > 0 ? info.discountPercent : 0;
  const basePrice = info?.price;
  const finalPrice = basePrice ? Math.round(basePrice * (1 - discount / 100)) : null;
  const name = lang === 'fa' ? room.name : room.nameEn;
  const tag = lang === 'fa' ? room.tag : room.tagEn;
  const cover = room.images?.[0] ? `${room.imageDir}/${room.images[0]}` : null;

  return (
    <article className={`${styles.tile} ${booked ? styles.booked : ''}`} data-room={room.slug}>
      <div className={styles.photo}>
        {cover && !coverMissing ? (
          <Image src={cover} alt="" fill sizes="(min-width: 900px) 300px, 45vw" className={styles.img} onError={() => setCoverMissing(true)} />
        ) : (
          <svg className={styles.placeholder} viewBox="0 0 40 52" aria-hidden="true">
            <path d="M4 50V20C4 9 11 3 20 3s16 6 16 17v30z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M11 50V22c0-6 4-10 9-10s9 4 9 10v28" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".6" />
          </svg>
        )}
        {discount > 0 && <span className={styles.ribbon}>{t('discountOff', { n: formatNumber(discount, lang) })}</span>}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>
          <Link className={styles.link} href={`/rooms/${room.slug}?checkIn=${checkIn}&checkOut=${checkOut}`}>{name}</Link>
          {tag && <span className={styles.tag}>{tag}</span>}
        </h3>

        <p className={booked ? styles.statusBooked : styles.status}>
          <i aria-hidden="true" />
          {booked ? t('bookedUntil', { date: formatDay(info.bookedUntil, lang) }) : t('free')}
        </p>

        {!booked && finalPrice && (
          <p className={styles.price}>
            <small>{t('fromPrice')}</small>
            {discount > 0 && <s>{formatNumber(basePrice, lang)}</s>}
            <strong>{formatNumber(finalPrice, lang)}</strong>
            <span>{t('currency')}</span>
          </p>
        )}
      </div>
    </article>
  );
}
