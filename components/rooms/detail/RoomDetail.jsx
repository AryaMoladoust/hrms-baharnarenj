'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/user/header/Header';
import RoomGallery from '@/components/rooms/gallery/RoomGallery';
import DateRangeFields from '@/components/user/booking/DateRangeFields';
import { useDateRange } from '@/components/user/booking/useDateRange';
import { usePreferences } from '@/components/providers/Preferences';
import { getRoomBySlug } from '@/lib/rooms';
import { getAvailability } from '@/lib/rooms/availability';
import { ADDONS, discounted } from '@/lib/pricing';
import { formatDay, formatNumber } from '@/lib/dates';
import styles from './RoomDetail.module.css';

const ADDON_KEYS = { breakfast: ['addonBreakfast', 'breakfast'], hygiene: ['addonHygiene', 'hygiene'] };
const UNIT_KEYS = { perPersonPerNight: 'unitPerPersonPerNight', perPerson: 'unitPerPerson', perNight: 'unitPerNight', flat: 'unitFlat' };

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
            <DateRangeFields range={range} />
          </div>

          {info && (
            <>
              <h2>{t('pricePerNightTitle')}</h2>
              <p className={styles.nightPrice}>
                {info.discountPercent > 0 && <s>{formatNumber(info.price, lang)}</s>}
                <strong>{price(info.price)}</strong> <span>{t('currency')}</span>
              </p>

              <h2>{t('addonsTitle')} <small>{t('optional')}</small></h2>
              <ul className={styles.plans}>
                {ADDONS.map((key) => (
                  <li key={key}>
                    <span><strong>{t(ADDON_KEYS[key][0])}</strong><small>{t(UNIT_KEYS[info.addons[key].unit])}</small></span>
                    <span className={styles.planPrice}><b dir="ltr">+{formatNumber(info.addons[key].price, lang)}</b> <small>{t('currency')}</small></span>
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
                  <strong>{price(info.price)}</strong>
                  <span>{t('currency')} / {t('perNight')}</span>
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
