'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/user/header/Header';
import RoomGallery from '@/components/rooms/gallery/RoomGallery';
import DateField from '@/components/user/booking/DateField';
import { useDateRange } from '@/components/user/booking/useDateRange';
import { usePreferences } from '@/components/providers/Preferences';
import { getRoomBySlug } from '@/lib/rooms';
import { getAvailability } from '@/lib/rooms/availability';
import { discounted, PLANS } from '@/lib/pricing';
import { formatDay, formatNumber } from '@/lib/dates';
import styles from './RoomDetail.module.css';

const PLAN_KEYS = { standard: ['planStandard', 'planStandardNote'], breakfast: ['planBreakfast', 'planBreakfastNote'], full: ['planFull', 'planFullNote'] };

export default function RoomDetail({ slug }) {
  const { t, lang } = usePreferences();
  const room = getRoomBySlug(slug);
  const params = useSearchParams();
  const initial = useMemo(() => ({ checkIn: params.get('checkIn'), checkOut: params.get('checkOut') }), [params]);
  const range = useDateRange(initial);
  const [info, setInfo] = useState(null);

  // Availability follows the chosen dates.
  useEffect(() => {
    if (!range.ready) return;
    let cancelled = false;
    getAvailability({ checkIn: range.checkIn, checkOut: range.checkOut }).then((list) => {
      if (!cancelled) setInfo(list.find((item) => item.slug === slug) || null);
    });
    return () => { cancelled = true; };
  }, [range.ready, range.checkIn, range.checkOut, slug]);

  const booked = info?.status === 'booked';
  const price = (value) => formatNumber(discounted(value, info.discountPercent), lang);
  const bookHref = `/booking?room=${slug}&checkIn=${range.checkIn}&checkOut=${range.checkOut}`;

  return (
    <main className={styles.page}>
      <Header solid />
      <div className={styles.layout}>
        <RoomGallery room={room} />

        <div className={styles.info}>
          <h1>{lang === 'fa' ? room.name : room.nameEn}</h1>
          <p className={booked ? styles.statusBooked : styles.status}>
            {booked ? t('bookedUntil', { date: formatDay(info.bookedUntil, lang) }) : t('free')}
          </p>
          <p className={styles.desc}>{lang === 'fa' ? room.description : room.descriptionEn}</p>

          <h2>{t('datesTitle')}</h2>
          <div className={styles.dates}>
            <DateField id="room-check-in" label={t('checkIn')} value={range.checkIn} min={range.minCheckIn} onChange={range.changeCheckIn} lang={lang} />
            <DateField id="room-check-out" label={t('checkOut')} hint={t('nights', { n: range.nights })} value={range.checkOut} min={range.minCheckOut} onChange={range.changeCheckOut} lang={lang} />
          </div>

          {info && (
            <>
              <h2>{t('plansTitle')}</h2>
              <ul className={styles.plans}>
                {PLANS.map((plan) => (
                  <li key={plan}>
                    <span><strong>{t(PLAN_KEYS[plan][0])}</strong><small>{t(PLAN_KEYS[plan][1])}</small></span>
                    <span className={styles.planPrice}>
                      {info.discountPercent > 0 && <s>{formatNumber(info.prices[plan], lang)}</s>}
                      <b>{price(info.prices[plan])}</b> <small>{t('currency')}</small>
                    </span>
                  </li>
                ))}
              </ul>
              <p className={styles.rule}>
                {t('guestRule', { n: formatNumber(info.guests.included, lang), price: formatNumber(info.guests.extraPrice, lang) })}
              </p>
            </>
          )}
        </div>
      </div>

      <div className={styles.bar}>
        {booked ? (
          <p className={styles.barNote}><strong>{t('roomBooked')}</strong><span>{t('roomBookedHint')}</span></p>
        ) : (
          <>
            <p className={styles.barPrice}>
              {info && (
                <>
                  <span>{t('fromPrice')}</span>
                  <strong>{price(info.prices.standard)}</strong>
                  <span>{t('currency')}</span>
                </>
              )}
            </p>
            <Link className={styles.book} href={bookHref}>{t('bookRoom')}</Link>
          </>
        )}
      </div>
    </main>
  );
}
