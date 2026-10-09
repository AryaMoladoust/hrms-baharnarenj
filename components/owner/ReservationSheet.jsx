'use client';

import { useEffect, useState } from 'react';
import Sheet from '@/components/owner/ui/Sheet';
import { Button, Chip, ErrorNote, Field, Loading, RoomDot, Segmented } from '@/components/owner/ui/Kit';
import { useOwner } from '@/components/owner/OwnerShell';
import { useOwnerData } from '@/components/owner/useOwnerData';
import { day, errorText, money, roomName, STATUS } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { ownerFetch } from '@/lib/owner/client';
import { formatNumber, nightsBetween } from '@/lib/dates';
import { settle } from '@/lib/owner/cancellation';
import { PAYMENT_METHODS } from '@/lib/owner/constants';
import styles from './ReservationSheet.module.css';

const METHOD_KEYS = { cash: 'ownPayCash', card: 'ownPayCard', transfer: 'ownPayTransfer', pos: 'ownPayPos', online: 'ownPayOnline' };
const LINE_KEYS = { room: 'ownLineRoom', extraGuests: 'ownLineExtra', breakfast: 'addonBreakfast', hygiene: 'addonHygiene' };

function Line({ label, children }) {
  return <div className={styles.line}><dt>{label}</dt><dd>{children}</dd></div>;
}

// Full details of one reservation, with the actions the owner needs: record a payment, cancel (with the policy's deduction), add a note.
export default function ReservationSheet({ id, onClose, onChanged }) {
  const { t, lang } = usePreferences();
  const { toast } = useOwner();
  const { data, error, loading, reload } = useOwnerData(id ? `reservations/${id}` : null);
  const [mode, setMode] = useState('view'); // view | cancel | pay
  const [percent, setPercent] = useState('15');
  const [reason, setReason] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  const r = data?.reservation;
  useEffect(() => {
    if (r) { setNote(r.note || ''); setMode('view'); setProblem(''); if (data.cancelSuggestion) setPercent(String(data.cancelSuggestion.percent)); }
  }, [r?.id, r?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (body, doneKey) => {
    setBusy(true); setProblem('');
    try {
      await ownerFetch(`reservations/${id}`, { method: 'PATCH', body });
      toast(t(doneKey));
      onChanged();
      await reload();
    } catch (e) { setProblem(errorText(e, t)); }
    setBusy(false);
  };

  const paid = r?.status === 'paid' && r.kind === 'booking';
  const p = Math.min(100, Math.max(0, Number(percent) || 0));
  const preview = paid ? settle(r.payment.amount, p) : null;
  const [statusKey, tone] = STATUS[r?.status] || STATUS.pending;
  const canCancel = r && r.status !== 'cancelled';

  return (
    <Sheet open={Boolean(id)} title={r ? `${t('ownReservation')} ${r.code}` : t('ownReservation')} onClose={onClose}
      footer={r && mode === 'view' && (
        <>
          {r.status === 'pending' && r.kind === 'booking' && <Button variant="primary" onClick={() => setMode('pay')}>{t('ownMarkPaid')}</Button>}
          {canCancel && <Button variant="ghost" onClick={() => setMode('cancel')}>{r.kind === 'block' ? t('ownReleaseBlock') : t('ownCancelBooking')}</Button>}
        </>
      )}>
      {loading && !r && <Loading />}
      {error && !r && <ErrorNote onRetry={reload} retryLabel={t('ownRetry')}>{t('ownErrServer')}</ErrorNote>}

      {r && mode === 'view' && (
        <>
          <div className={styles.top}>
            <strong><RoomDot slug={r.roomSlug} /> {roomName(r.roomSlug, lang)}</strong>
            <Chip tone={tone}>{t(statusKey)}</Chip>
          </div>
          <dl className={styles.lines}>
            <Line label={t('ownStay')}>{day(r.checkIn, lang, true)} → {day(r.checkOut, lang, true)} ({t('nights', { n: formatNumber(nightsBetween(r.checkIn, r.checkOut), lang) })})</Line>
            {r.kind === 'booking' && (
              <>
                <Line label={t('fullName')}>{r.guest?.fullName || '—'}</Line>
                {r.guest?.mobile && <Line label={t('mobile')}><a href={`tel:${r.guest.mobile}`} dir="ltr">{r.guest.mobile}</a></Line>}
                {r.guest?.nationalId && <Line label={t('nationalId')}><span dir="ltr">{r.guest.nationalId}</span></Line>}
                <Line label={t('guestsCount')}>{formatNumber(r.guests, lang)}</Line>
                <Line label={t('addonsTitle')}>{[r.addons?.breakfast && t('addonBreakfast'), r.addons?.hygiene && t('addonHygiene')].filter(Boolean).join('، ') || '—'}</Line>
                <Line label={t('ownSource')}>{r.source === 'manual' ? `${t('ownSourceManual')}${r.createdBy ? ` (${r.createdBy})` : ''}` : t('ownSourceOnline')}</Line>
              </>
            )}
            {r.note && r.kind === 'block' && <Line label={t('ownNote')}>{r.note}</Line>}
          </dl>

          {r.kind === 'booking' && (
            <section className={styles.box}>
              <h3>{t('ownPrice')}</h3>
              <dl className={styles.lines}>
                {(r.pricing?.lines || []).map((l, i) => (
                  <Line key={i} label={l.type === 'extraGuests' ? t('extraGuestsLine', { n: formatNumber(l.extraGuests, lang), nights: formatNumber(l.nights, lang) }) : `${t(LINE_KEYS[l.type] || 'ownLineRoom')}${l.type === 'room' ? ` (${t('nights', { n: formatNumber(l.nights, lang) })})` : ''}`}>{money(l.amount, lang, t)}</Line>
                ))}
                {r.pricing?.overridden && <Line label={t('ownPriceOverridden')}>{money(r.pricing.quoteTotal, lang, t)} → {money(r.pricing.total, lang, t)}</Line>}
                <Line label={t('total')}><strong>{money(r.pricing?.total || 0, lang, t)}</strong></Line>
              </dl>
              {r.payment?.amount > 0 && (
                <p className={styles.sub}>{t('ownPaidOn', { date: day(r.payment.paidDate, lang), method: t(METHOD_KEYS[r.payment.method] || 'ownPayCash') })}{r.payment.refId ? ` · ${r.payment.refId}` : ''}</p>
              )}
            </section>
          )}

          {r.status === 'cancelled' && r.cancellation && (
            <section className={styles.box}>
              <h3>{t('ownCancellation')}</h3>
              <dl className={styles.lines}>
                <Line label={t('ownCancelledOn')}>{day(r.cancellation.cancelledDate, lang)}{r.cancellation.by ? ` (${r.cancellation.by})` : ''}</Line>
                {r.payment?.amount > 0 && (
                  <>
                    <Line label={t('ownDeduction', { n: formatNumber(r.cancellation.deductionPercent, lang) })}>{money(r.cancellation.deductionAmount, lang, t)}</Line>
                    <Line label={t('ownRefund')}>{money(r.cancellation.refundAmount, lang, t)}</Line>
                  </>
                )}
                {r.cancellation.reason && <Line label={t('ownReason')}>{r.cancellation.reason}</Line>}
              </dl>
            </section>
          )}

          {r.kind === 'booking' && r.status !== 'cancelled' && (
            <Field label={t('ownNote')}>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
              {note !== (r.note || '') && <Button variant="ghost" busy={busy} onClick={() => act({ action: 'note', note }, 'ownSaved')}>{t('ownSaveNote')}</Button>}
            </Field>
          )}
        </>
      )}

      {r && mode === 'pay' && (
        <>
          <p className={styles.lead}>{t('ownPayHelp', { amount: money(r.pricing.total, lang, t) })}</p>
          <Segmented value={method} onChange={setMethod} ariaLabel={t('ownPayMethod')} options={PAYMENT_METHODS.filter((m) => m !== 'online').map((m) => ({ value: m, label: t(METHOD_KEYS[m]) }))} />
          {problem && <ErrorNote>{problem}</ErrorNote>}
          <Button variant="primary" busy={busy} onClick={() => act({ action: 'pay', method }, 'ownPaidDone')}>{t('ownConfirmPaid')}</Button>
          <Button variant="ghost" onClick={() => setMode('view')}>{t('termsBack')}</Button>
        </>
      )}

      {r && mode === 'cancel' && (
        <>
          {paid ? (
            <>
              {data.cancelSuggestion && (
                <p className={styles.lead}>{data.cancelSuggestion.late ? t('ownCancelLate', { h: formatNumber(Math.max(0, data.cancelSuggestion.hours), lang) }) : t('ownCancelEarly', { h: formatNumber(data.cancelSuggestion.hours, lang) })}</p>
              )}
              <Field label={t('ownDeductionPercent')} hint={t('ownDeductionHint')}>
                <input inputMode="decimal" value={percent} onChange={(e) => setPercent(e.target.value.replace(/[^0-9.]/g, ''))} dir="ltr" />
              </Field>
              <dl className={styles.box}>
                <Line label={t('ownPaidAmount')}>{money(r.payment.amount, lang, t)}</Line>
                <Line label={t('ownDeduction', { n: formatNumber(p, lang) })}>{money(preview.deductionAmount, lang, t)}</Line>
                <Line label={t('ownRefund')}><strong>{money(preview.refundAmount, lang, t)}</strong></Line>
              </dl>
            </>
          ) : <p className={styles.lead}>{r.kind === 'block' ? t('ownReleaseHelp') : t('ownCancelUnpaidHelp')}</p>}
          <Field label={t('ownReason')}><input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} /></Field>
          {problem && <ErrorNote>{problem}</ErrorNote>}
          <Button variant="danger" busy={busy} onClick={() => act({ action: 'cancel', percent: paid ? p : 0, reason }, 'ownCancelledDone')}>{r.kind === 'block' ? t('ownReleaseBlock') : t('ownConfirmCancel')}</Button>
          <Button variant="ghost" onClick={() => setMode('view')}>{t('termsBack')}</Button>
        </>
      )}
    </Sheet>
  );
}
