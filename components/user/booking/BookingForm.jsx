'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
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
import TermsModal from './TermsModal';
import styles from './BookingForm.module.css';

const icon = (paths) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);
const ICONS = {
  user: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>),
  users: icon(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14a5 5 0 014.5 5" /></>),
  sparkle: icon(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z" />),
  receipt: icon(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>),
};

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
  const [termsOpen, setTermsOpen] = useState(false);
  const [coverMissing, setCoverMissing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!range.ready) return;
    getAvailability({ checkIn: range.checkIn, checkOut: range.checkOut }).then((list) => setInfo(list.find((item) => item.slug === slug) || null));
  }, [range.ready, range.checkIn, range.checkOut, slug]);

  const quote = useMemo(() => (info ? calculateQuote({ info, selected, nights: range.nights, guests }) : null), [info, selected, range.nights, guests]);
  const num = (value) => formatNumber(value, lang);

  // The hygiene pack is sold together with breakfast: ticking the pack ticks breakfast, unticking breakfast unticks the pack.
  const toggleAddon = (key, checked) => setSelected((prev) => {
    const next = { ...prev, [key]: checked };
    if (key === 'hygiene' && checked) next.breakfast = true;
    if (key === 'breakfast' && !checked) next.hygiene = false;
    return next;
  });
  const setField = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));

  // Step 1: validate the form, then ask the guest to accept the terms.
  const onSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (form.fullName.trim().length < 3) next.fullName = t('errName');
    if (!isValidMobile(form.mobile)) next.mobile = t('errMobile');
    if (!isValidNationalId(form.nationalId)) next.nationalId = t('errNationalId');
    setErrors(next);
    if (Object.keys(next).length) return;
    setTermsOpen(true);
  };

  const closeTerms = useCallback(() => setTermsOpen(false), []);

  // Step 2: the guest accepted the terms in the popup -> create the reservation and go to the payment gateway.
  const confirmAndPay = async () => {
    setTermsOpen(false);
    setSubmitError('');
    setStatus('sending');
    const result = await submitReservation({
      slug, guests, addons: selected,
      checkIn: range.checkIn, checkOut: range.checkOut,
      fullName: form.fullName.trim(),
      mobile: normalizeDigits(form.mobile),
      nationalId: normalizeDigits(form.nationalId),
      termsAccepted: true,
    });
    if (!result.ok) {
      setStatus('idle');
      setSubmitError(t(result.error === 'room_booked' ? 'errBooked' : result.error === 'validation' ? 'errCheckForm' : 'errBookingServer'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // With a payment gateway connected the server returns paymentUrl; until then the booking page shows the booking code.
    window.location.href = result.paymentUrl || `/booking/done?code=${encodeURIComponent(result.code)}${result.paid ? '' : '&pending=1'}`;
  };

  const booked = info?.status === 'booked';

  const lineLabel = (line) => {
    if (line.type === 'room') return t('roomLine', { n: num(line.nights) });
    if (line.type === 'extraGuests') return t('extraGuestsLine', { n: num(line.extraGuests), nights: num(line.nights) });
    const qty = t(QTY_KEYS[line.unit], { guests: num(line.guests), nights: num(line.nights) });
    return `${t(ADDON_KEYS[line.type])}${qty ? `: ${qty}` : ''}`;
  };

  const name = lang === 'fa' ? room.name : room.nameEn;
  const cover = room.images?.[0] ? `${room.imageDir}/${room.images[0]}` : null;
  const sending = status === 'sending';

  const payButton = (className) => (
    <button type="submit" className={className} disabled={booked || sending || !quote}>
      {sending ? t('redirecting') : t('pay')}
    </button>
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Header />
        <div className={styles.heroInner}>
          <h1>{t('bookingTitle')}</h1>
          <div className={styles.roomCard} data-room={slug}>
            <div className={styles.thumb}>
              {cover && !coverMissing ? (
                <Image src={cover} alt="" fill sizes="96px" onError={() => setCoverMissing(true)} />
              ) : (
                <svg viewBox="0 0 40 52" aria-hidden="true"><path d="M4 50V20C4 9 11 3 20 3s16 6 16 17v30z" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
              )}
            </div>
            <div className={styles.roomInfo}>
              <strong>{name}</strong>
              {range.ready && <span>{formatDay(range.checkIn, lang)} – {formatDay(range.checkOut, lang)}</span>}
              {range.ready && <em>{t('nights', { n: num(range.nights) })}</em>}
            </div>
            <Link className={styles.change} href={`/rooms/${slug}?checkIn=${range.checkIn}&checkOut=${range.checkOut}`}>{t('change')}</Link>
          </div>
        </div>
        <div className={styles.eave} aria-hidden="true" />
      </section>

      <form className={styles.layout} onSubmit={onSubmit} noValidate>
        <div className={styles.main}>
          {booked && <p className={styles.alert} role="alert">{t('roomBooked')}. {t('roomBookedHint')}</p>}
          {submitError && <p className={styles.alert} role="alert">{submitError}</p>}

          <section className={styles.card}>
            <h2><span className={styles.cardIcon}>{ICONS.user}</span>{t('yourDetails')}</h2>
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
            </div>
          </section>

          <section className={styles.card}>
            <h2><span className={styles.cardIcon}>{ICONS.users}</span>{t('guestsCount')}</h2>
            <div className={styles.stepper}>
              <button type="button" aria-label={t('guestsMinus')} disabled={guests <= 1} onClick={() => setGuests(guests - 1)}>−</button>
              <output aria-live="polite"><b>{num(guests)}</b> <span>{t('guestsUnit', { n: '' }).trim()}</span></output>
              <button type="button" aria-label={t('guestsPlus')} disabled={info ? guests >= info.guests.max : false} onClick={() => setGuests(guests + 1)}>+</button>
            </div>
            {info && <p className={styles.note}>{t('guestsMax', { n: num(info.guests.max) })}. {t('guestRule', { n: num(info.guests.included), price: num(info.guests.extraPrice) })}</p>}
          </section>

          <section className={styles.card}>
            <h2><span className={styles.cardIcon}>{ICONS.sparkle}</span>{t('addonsTitle')} <small>{t('optional')}</small></h2>
            <div className={styles.addons}>
              {info && ADDONS.map((key) => {
                const addon = info.addons[key];
                const on = selected[key];
                const qty = addonQuantity(addon.unit, guests, range.nights);
                return (
                  <label key={key} className={on ? styles.addonOn : styles.addon}>
                    <input type="checkbox" checked={on} onChange={(event) => toggleAddon(key, event.target.checked)} />
                    <span>
                      <strong>{t(ADDON_KEYS[key])}</strong>
                      <small>{t(UNIT_KEYS[addon.unit])}{addon.requires ? ` · ${t('addonWithBreakfast')}` : ''}</small>
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
          </section>
        </div>

        <aside className={styles.summary}>
          <h2><span className={styles.cardIcon}>{ICONS.receipt}</span>{t('summary')}</h2>
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
          {payButton(styles.pay)}
        </aside>

        {/* On phones the total and the pay button stay pinned to the bottom of the screen. */}
        <div className={styles.bar}>
          <p><span>{t('total')}</span><strong>{quote ? num(quote.total) : '…'} <small>{t('currency')}</small></strong></p>
          {payButton(styles.barPay)}
        </div>
      </form>
      <TermsModal open={termsOpen} onClose={closeTerms} onAccept={confirmAndPay} />
    </main>
  );
}
