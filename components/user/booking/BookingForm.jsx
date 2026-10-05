'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/user/header/Header';
import { useDateRange } from '@/components/user/booking/useDateRange';
import { usePreferences } from '@/components/providers/Preferences';
import { getRoomBySlug } from '@/lib/rooms';
import { getAvailability } from '@/lib/rooms/availability';
import { calculateQuote, PLANS } from '@/lib/pricing';
import { isValidMobile, isValidNationalId, normalizeDigits } from '@/lib/booking/validation';
import { submitReservation } from '@/lib/booking/submit';
import { formatDay, formatNumber } from '@/lib/dates';
import styles from './BookingForm.module.css';

const PLAN_KEYS = { standard: ['planStandard', 'planStandardNote'], breakfast: ['planBreakfast', 'planBreakfastNote'], full: ['planFull', 'planFullNote'] };

export default function BookingForm({ slug }) {
  const { t, lang } = usePreferences();
  const room = getRoomBySlug(slug);
  const params = useSearchParams();
  const initial = useMemo(() => ({ checkIn: params.get('checkIn'), checkOut: params.get('checkOut') }), [params]);
  const range = useDateRange(initial);
  const [info, setInfo] = useState(null);

  const [plan, setPlan] = useState(PLANS.includes(params.get('plan')) ? params.get('plan') : 'standard');
  const [guests, setGuests] = useState(2);
  const [form, setForm] = useState({ fullName: '', mobile: '', nationalId: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!range.ready) return;
    getAvailability({ checkIn: range.checkIn, checkOut: range.checkOut }).then((list) => setInfo(list.find((item) => item.slug === slug) || null));
  }, [range.ready, range.checkIn, range.checkOut, slug]);

  const quote = useMemo(() => (info ? calculateQuote({ info, plan, nights: range.nights, guests }) : null), [info, plan, range.nights, guests]);
  const num = (value) => formatNumber(value, lang);
  const setField = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.fullName.trim().length < 3) next.fullName = t('errName');
    if (!isValidMobile(form.mobile)) next.mobile = t('errMobile');
    if (!isValidNationalId(form.nationalId)) next.nationalId = t('errNationalId');
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('sending');
    const result = await submitReservation({
      slug, plan, guests,
      checkIn: range.checkIn, checkOut: range.checkOut,
      fullName: form.fullName.trim(),
      mobile: normalizeDigits(form.mobile),
      nationalId: normalizeDigits(form.nationalId),
    });
    if (result.paymentUrl) window.location.href = result.paymentUrl;
  };

  const booked = info?.status === 'booked';

  return (
    <main className={styles.page}>
      <Header solid />
      <form className={styles.layout} onSubmit={onSubmit} noValidate>
        <div className={styles.main}>
          <h1>{t('bookingTitle')}</h1>

          <div className={styles.room} data-room={slug}>
            <div>
              <strong>{lang === 'fa' ? room.name : room.nameEn}</strong>
              <span>{range.ready && `${formatDay(range.checkIn, lang)} – ${formatDay(range.checkOut, lang)}، ${t('nights', { n: range.nights })}`}</span>
            </div>
            <Link href={`/rooms/${slug}?checkIn=${range.checkIn}&checkOut=${range.checkOut}`}>{t('change')}</Link>
          </div>

          {booked && <p className={styles.alert} role="alert">{t('roomBooked')}. {t('roomBookedHint')}</p>}

          <h2>{t('plansTitle')}</h2>
          <div className={styles.plans} role="radiogroup" aria-label={t('plansTitle')}>
            {PLANS.map((id) => (
              <label key={id} className={plan === id ? styles.planOn : styles.plan}>
                <input type="radio" name="plan" value={id} checked={plan === id} onChange={() => setPlan(id)} />
                <span><strong>{t(PLAN_KEYS[id][0])}</strong><small>{t(PLAN_KEYS[id][1])}</small></span>
                {info && <b>{num(calculateQuote({ info, plan: id, nights: 1, guests: 1 }).perNight)}</b>}
              </label>
            ))}
          </div>

          <h2>{t('yourDetails')}</h2>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span>{t('fullName')}</span>
              <input value={form.fullName} onChange={setField('fullName')} autoComplete="name" aria-invalid={Boolean(errors.fullName)} />
              {errors.fullName && <em role="alert">{errors.fullName}</em>}
            </label>
            <label className={styles.field}>
              <span>{t('mobile')}</span>
              <input value={form.mobile} onChange={setField('mobile')} inputMode="numeric" autoComplete="tel" dir="ltr" maxLength={11} aria-invalid={Boolean(errors.mobile)} />
              {errors.mobile && <em role="alert">{errors.mobile}</em>}
            </label>
            <label className={styles.field}>
              <span>{t('nationalId')}</span>
              <input value={form.nationalId} onChange={setField('nationalId')} inputMode="numeric" dir="ltr" maxLength={10} aria-invalid={Boolean(errors.nationalId)} />
              {errors.nationalId && <em role="alert">{errors.nationalId}</em>}
            </label>

            <div className={styles.field}>
              <span>{t('guestsCount')}</span>
              <div className={styles.stepper}>
                <button type="button" aria-label={t('guestsMinus')} disabled={guests <= 1} onClick={() => setGuests(guests - 1)}>−</button>
                <output>{t('guestsUnit', { n: num(guests) })}</output>
                <button type="button" aria-label={t('guestsPlus')} disabled={info ? guests >= info.guests.max : false} onClick={() => setGuests(guests + 1)}>+</button>
              </div>
              {info && <small>{t('guestsMax', { n: num(info.guests.max) })}. {t('guestRule', { n: num(info.guests.included), price: num(info.guests.extraPrice) })}</small>}
            </div>
          </div>
        </div>

        <aside className={styles.summary}>
          <h2>{t('summary')}</h2>
          {quote && (
            <dl>
              <div><dt>{t('stayLine', { plan: t(PLAN_KEYS[plan][0]), n: num(range.nights) })}</dt><dd>{num(quote.roomTotal)}</dd></div>
              {quote.extraGuests > 0 && (
                <div><dt>{t('extraLine', { n: num(quote.extraGuests), nights: num(range.nights) })}</dt><dd>{num(quote.extraTotal)}</dd></div>
              )}
              {quote.discountPercent > 0 && <p className={styles.discount}>{t('discountApplied', { n: num(quote.discountPercent) })}</p>}
              <div className={styles.total}><dt>{t('total')}</dt><dd>{num(quote.total)} <small>{t('currency')}</small></dd></div>
            </dl>
          )}
          <button type="submit" className={styles.pay} disabled={booked || status === 'sending'}>
            {status === 'sending' ? t('redirecting') : t('pay')}
          </button>
        </aside>
      </form>
    </main>
  );
}
