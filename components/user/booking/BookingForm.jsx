'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/user/header/Header';
import { useDateRange } from '@/components/user/booking/useDateRange';
import { usePreferences } from '@/components/providers/Preferences';
import { getRoomBySlug } from '@/lib/rooms';
import { getAvailability } from '@/lib/rooms/availability';
import { addonQuantity, ADDONS, calculateQuote } from '@/lib/pricing';
import { isValidMobile, isValidNationalId, normalizeDigits } from '@/lib/booking/validation';
import { submitReservation } from '@/lib/booking/submit';
import { formatDay, formatNumber } from '@/lib/dates';
import styles from './BookingForm.module.css';

const ADDON_KEYS = { breakfast: 'addonBreakfast', hygiene: 'addonHygiene' };
const UNIT_KEYS = { perPersonPerNight: 'unitPerPersonPerNight', perPerson: 'unitPerPerson', perNight: 'unitPerNight', flat: 'unitFlat' };
const QTY_KEYS = { perPersonPerNight: 'qtyPerPersonPerNight', perPerson: 'qtyPerPerson', perNight: 'qtyPerNight', flat: 'qtyFlat' };

export default function BookingForm({ slug }) {
  const { t, lang } = usePreferences();
  const room = getRoomBySlug(slug);
  const params = useSearchParams();
  const initial = useMemo(() => ({ checkIn: params.get('checkIn'), checkOut: params.get('checkOut') }), [params]);
  const range = useDateRange(initial);
  const [info, setInfo] = useState(null);

  const [selected, setSelected] = useState({ breakfast: false, hygiene: false });
  const [guests, setGuests] = useState(2);
  const [form, setForm] = useState({ fullName: '', mobile: '', nationalId: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!range.ready) return;
    getAvailability({ checkIn: range.checkIn, checkOut: range.checkOut }).then((list) => setInfo(list.find((item) => item.slug === slug) || null));
  }, [range.ready, range.checkIn, range.checkOut, slug]);

  const quote = useMemo(() => (info ? calculateQuote({ info, selected, nights: range.nights, guests }) : null), [info, selected, range.nights, guests]);
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
      slug, guests, addons: selected,
      checkIn: range.checkIn, checkOut: range.checkOut,
      fullName: form.fullName.trim(),
      mobile: normalizeDigits(form.mobile),
      nationalId: normalizeDigits(form.nationalId),
    });
    if (result.paymentUrl) window.location.href = result.paymentUrl;
  };

  const booked = info?.status === 'booked';

  const lineLabel = (line) => {
    if (line.type === 'room') return t('roomLine', { n: num(line.nights) });
    if (line.type === 'extraGuests') return t('extraGuestsLine', { n: num(line.extraGuests), nights: num(line.nights) });
    const qty = t(QTY_KEYS[line.unit], { guests: num(line.guests), nights: num(line.nights) });
    return `${t(ADDON_KEYS[line.type])}${qty ? `: ${qty}` : ''}`;
  };

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

          <h2>{t('addonsTitle')} <small>{t('optional')}</small></h2>
          <div className={styles.addons}>
            {info && ADDONS.map((key) => {
              const addon = info.addons[key];
              const on = selected[key];
              const qty = addonQuantity(addon.unit, guests, range.nights);
              return (
                <label key={key} className={on ? styles.addonOn : styles.addon}>
                  <input type="checkbox" checked={on} onChange={(event) => setSelected((prev) => ({ ...prev, [key]: event.target.checked }))} />
                  <span>
                    <strong>{t(ADDON_KEYS[key])}</strong>
                    <small>{t(UNIT_KEYS[addon.unit])}</small>
                    {on && (
                      <em>
                        {t(QTY_KEYS[addon.unit], { guests: num(guests), nights: num(range.nights) })}
                        {addon.unit !== 'flat' && ` = ${num(addon.price * qty)}`}
                      </em>
                    )}
                  </span>
                  <b dir="ltr">+{num(addon.price)}</b>
                </label>
              );
            })}
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
                <output aria-live="polite"><b>{num(guests)}</b> <span>{t('guestsUnit', { n: '' }).trim()}</span></output>
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
              {quote.lines.map((line) => (
                <div key={line.type}>
                  <dt>{lineLabel(line)}</dt>
                  <dd>{num(line.amount)}</dd>
                </div>
              ))}
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
