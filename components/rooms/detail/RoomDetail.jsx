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
import { POLICIES } from '@/lib/policies';
import { formatDay, formatNumber } from '@/lib/dates';
import styles from './RoomDetail.module.css';

const icon = (paths) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);
const ICONS = {
  calendar: icon(<><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></>),
  coin: icon(<><circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.5h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4M12 7.5v1.5M12 15v1.5" /></>),
  sparkle: icon(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z" />),
  shield: icon(<><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>),
};

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

  const features = lang === 'fa' ? room.features : room.featuresEn;
  const n = (value) => formatNumber(value, lang);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Header />
        <div className={styles.heroInner}>
          <div className={styles.titleBlock}>
            <h1>
              <span className={styles.dot} data-room={slug} aria-hidden="true" />
              {lang === 'fa' ? room.name : room.nameEn}
            </h1>
            <div className={styles.chips}>
              {(lang === 'fa' ? room.tag : room.tagEn) && <span className={styles.tag}>{lang === 'fa' ? room.tag : room.tagEn}</span>}
              <span className={booked ? styles.statusBooked : styles.status}>
                <i aria-hidden="true" />
                {booked ? t('bookedUntil', { date: formatDay(info.bookedUntil, lang) }) : t('free')}
              </span>
            </div>
          </div>
          <RoomGallery room={room} />
        </div>
        <div className={styles.eave} aria-hidden="true" />
      </section>

      <div className={styles.content}>
        <section className={styles.card}>
          <h2><span className={styles.cardIcon}>{ICONS.calendar}</span>{t('datesTitle')}</h2>
          <div className={styles.dates}>
            <DateRangeFields range={range} />
          </div>
        </section>

        {info && (
          <section className={styles.priceCard}>
            <h2><span className={styles.cardIcon}>{ICONS.coin}</span>{t('pricePerNightTitle')}</h2>
            <p className={styles.nightPrice}>
              {info.discountPercent > 0 && <s>{n(info.price)}</s>}
              <strong>{price(info.price)}</strong> <span>{t('currency')}</span>
            </p>

            <h3>{t('addonsTitle')} <small>{t('optional')}</small></h3>
            <ul className={styles.addons}>
              {ADDONS.map((key) => (
                <li key={key}>
                  <span><strong>{t(ADDON_KEYS[key][0])}</strong><small>{t(UNIT_KEYS[info.addons[key].unit])}{info.addons[key].requires ? ` · ${t('addonWithBreakfast')}` : ''}</small></span>
                  <span className={styles.addonPrice}><b dir="ltr">+{n(info.addons[key].price)}</b> <small>{t('currency')}</small></span>
                </li>
              ))}
            </ul>
            <p className={styles.rule}>{t('guestRule', { n: n(info.guests.included), price: n(info.guests.extraPrice) })}</p>
          </section>
        )}

        {features.length > 0 && (
          <section className={styles.card}>
            <h2><span className={styles.cardIcon}>{ICONS.sparkle}</span>{t('factsTitle')}</h2>
            <ul className={styles.facts}>
              {features.map((feature) => (
                <li key={feature}>
                  <span className={styles.tick}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.card}>
          <h2><span className={styles.cardIcon}>{ICONS.shield}</span>{t('cancelTitle')}</h2>
          <ul className={styles.policy}>
            <li>{t('cancelGeneral', { n: n(POLICIES.cancellationPercent) })}</li>
            <li>{t('cancelLate', { hours: n(POLICIES.lateCancellationHours), n: n(POLICIES.lateCancellationPercent) })}</li>
          </ul>
        </section>
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
