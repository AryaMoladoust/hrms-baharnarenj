'use client';

import { useEffect, useMemo, useState } from 'react';
import Sheet from '@/components/owner/ui/Sheet';
import { Button, ErrorNote, Field, RoomDot, Segmented } from '@/components/owner/ui/Kit';
import { useOwner } from '@/components/owner/OwnerShell';
import { errorText, money, roomName } from '@/components/owner/format';
import DateRangeFields from '@/components/user/booking/DateRangeFields';
import { useDateRange } from '@/components/user/booking/useDateRange';
import { usePreferences } from '@/components/providers/Preferences';
import { ApiError, ownerFetch } from '@/lib/owner/client';
import { calculateQuote } from '@/lib/pricing';
import { formatNumber } from '@/lib/dates';
import { rooms } from '@/lib/rooms';
import { GUEST_RULES } from '@/lib/rooms/prices';
import { buildRoomInfos } from '@/lib/rooms/info';
import { normalizeDigits } from '@/lib/booking/validation';
import { PAYMENT_METHODS } from '@/lib/owner/constants';
import styles from './ManualReservationSheet.module.css';

const METHOD_KEYS = { cash: 'ownPayCash', card: 'ownPayCard', transfer: 'ownPayTransfer', pos: 'ownPayPos' };

/**
 * Enter a booking taken by phone / Instagram / at the door, or block dates (maintenance, family stay...).
 * The price is calculated like on the website (same price list and the owner's percentage) and can be changed by hand.
 */
export default function ManualReservationSheet({ open, initial, onClose, onCreated }) {
  const { t, lang } = usePreferences();
  const { toast } = useOwner();
  const range = useDateRange(initial);
  const [mode, setMode] = useState('booking');
  const [slug, setSlug] = useState('bahar');
  const [guests, setGuests] = useState(2);
  const [addons, setAddons] = useState({ breakfast: false, hygiene: false });
  const [form, setForm] = useState({ fullName: '', mobile: '', nationalId: '', note: '', price: '' });
  const [paid, setPaid] = useState(true);
  const [method, setMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(initial?.mode || 'booking');
    setSlug(initial?.slug || 'bahar');
    setGuests(2); setAddons({ breakfast: false, hygiene: false }); setPaid(true); setMethod('cash');
    setForm({ fullName: '', mobile: '', nationalId: '', note: '', price: '' }); setErrors({}); setProblem('');
    ownerFetch('settings').then((s) => setDiscount(s.discountPercent)).catch(() => {});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const max = GUEST_RULES[slug].max;
  useEffect(() => { if (guests > max) setGuests(max); }, [max, guests]);

  const quote = useMemo(() => {
    if (!range.ready || mode !== 'booking') return null;
    const info = buildRoomInfos({ checkIn: range.checkIn, checkOut: range.checkOut, discountPercent: discount }).find((i) => i.slug === slug);
    return calculateQuote({ info, selected: addons, nights: range.nights, guests });
  }, [range.ready, range.checkIn, range.checkOut, range.nights, mode, slug, addons, guests, discount]);

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });
  const toggleAddon = (key) => {
    const on = !addons[key];
    const next = { ...addons, [key]: on };
    if (key === 'hygiene' && on) next.breakfast = true;
    if (key === 'breakfast' && !on) next.hygiene = false;
    setAddons(next);
  };

  const submit = async () => {
    setBusy(true); setErrors({}); setProblem('');
    try {
      const priceText = normalizeDigits(form.price).replace(/[^0-9]/g, '');
      await ownerFetch('reservations', {
        method: 'POST',
        body: { mode, slug, checkIn: range.checkIn, checkOut: range.checkOut, guests, addons, ...form, mobile: normalizeDigits(form.mobile), nationalId: normalizeDigits(form.nationalId), paid, method, price: priceText ? Number(priceText) : null },
      });
      toast(t(mode === 'block' ? 'ownBlockDone' : 'ownBookingDone'));
      onCreated();
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.code === 'validation') setErrors(Object.fromEntries(Object.entries(e.fields).map(([k, v]) => [k, t(v)])));
      else setProblem(errorText(e, t));
    }
    setBusy(false);
  };

  return (
    <Sheet open={open} title={mode === 'block' ? t('ownBlockDates') : t('ownNewBooking')} onClose={onClose}
      footer={<Button variant="primary" busy={busy || !range.ready} onClick={submit}>{mode === 'block' ? t('ownBlockConfirm') : t('ownSaveBooking')}</Button>}>
      <Segmented value={mode} onChange={setMode} ariaLabel={t('ownNewBooking')} options={[{ value: 'booking', label: t('ownModeBooking') }, { value: 'block', label: t('ownModeBlock') }]} />

      <div className={styles.rooms} role="radiogroup" aria-label={t('ownRoom')}>
        {rooms.map((room) => (
          <button key={room.slug} type="button" role="radio" aria-checked={slug === room.slug} className={slug === room.slug ? styles.roomOn : styles.room} onClick={() => setSlug(room.slug)}>
            <RoomDot slug={room.slug} /> {roomName(room.slug, lang)}
          </button>
        ))}
      </div>
      {errors.slug && <ErrorNote>{errors.slug}</ErrorNote>}

      <div className={styles.dates}><DateRangeFields range={range} /></div>
      {(errors.checkIn || errors.checkOut) && <ErrorNote>{errors.checkIn || errors.checkOut}</ErrorNote>}

      {mode === 'block' ? (
        <Field label={t('ownNote')} hint={t('ownBlockHint')}><input value={form.note} onChange={set('note')} maxLength={300} /></Field>
      ) : (
        <>
          <Field label={t('fullName')} error={errors.fullName}><input value={form.fullName} onChange={set('fullName')} autoComplete="off" /></Field>
          <div className={styles.two}>
            <Field label={t('mobile')} error={errors.mobile}><input value={form.mobile} onChange={set('mobile')} inputMode="numeric" dir="ltr" maxLength={11} /></Field>
            <Field label={`${t('nationalId')} (${t('optional')})`} error={errors.nationalId}><input value={form.nationalId} onChange={set('nationalId')} inputMode="numeric" dir="ltr" maxLength={10} /></Field>
          </div>

          <div className={styles.stepper}>
            <span>{t('guestsCount')}</span>
            <div>
              <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1} aria-label={t('guestsMinus')}>−</button>
              <output><b>{formatNumber(guests, lang)}</b> <small>{t('guestsMax', { n: formatNumber(max, lang) })}</small></output>
              <button type="button" onClick={() => setGuests(Math.min(max, guests + 1))} disabled={guests >= max} aria-label={t('guestsPlus')}>+</button>
            </div>
          </div>
          {errors.guests && <ErrorNote>{errors.guests}</ErrorNote>}

          <div className={styles.addons}>
            {['breakfast', 'hygiene'].map((key) => (
              <label key={key} className={addons[key] ? styles.addonOn : styles.addon}>
                <input type="checkbox" checked={addons[key]} onChange={() => toggleAddon(key)} />
                {t(key === 'breakfast' ? 'addonBreakfast' : 'addonHygiene')}
              </label>
            ))}
          </div>

          <div className={styles.pay}>
            <label className={paid ? styles.addonOn : styles.addon}><input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />{t('ownPaidAlready')}</label>
            {paid && <Segmented value={method} onChange={setMethod} ariaLabel={t('ownPayMethod')} options={PAYMENT_METHODS.filter((m) => m !== 'online').map((m) => ({ value: m, label: t(METHOD_KEYS[m]) }))} />}
            {!paid && <p className={styles.hold}>{t('ownHoldHelp')}</p>}
          </div>

          {quote && (
            <div className={styles.quote}>
              <span>{t('ownCalculated')}</span>
              <strong>{money(quote.total, lang, t)}</strong>
            </div>
          )}
          <Field label={t('ownCustomPrice')} error={errors.price} hint={t('ownCustomPriceHint')}>
            <input value={form.price} onChange={set('price')} inputMode="numeric" dir="ltr" placeholder={quote ? String(quote.total) : ''} />
          </Field>
          <Field label={t('ownNote')}><input value={form.note} onChange={set('note')} maxLength={300} /></Field>
        </>
      )}
      {problem && <ErrorNote>{problem}</ErrorNote>}
    </Sheet>
  );
}
