'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePreferences } from '@/components/providers/Preferences';
import { monthCells, monthTitle, partsOf, shiftMonth, systemFor, WEEKDAYS } from '@/lib/calendar';
import { addDays, formatDay, formatNumber, toInputDate } from '@/lib/dates';
import styles from './DateRangeSheet.module.css';

const Chevron = ({ flip }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={flip ? styles.flip : undefined}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

/**
 * One calendar, one date. mode 'in' picks the check-in day (today is selected by default);
 * mode 'out' picks the check-out day and depends on check-in: earlier days and the check-in day itself are disabled.
 * Picking a day closes the sheet. The calendar is Jalali in both languages.
 */
export default function DateRangeSheet({ open, mode, range, onClose }) {
  const { t, lang } = usePreferences();
  const system = systemFor(lang);
  const today = toInputDate(new Date());
  const todayParts = partsOf(today, system);
  const [view, setView] = useState(null);

  const firstAllowed = mode === 'out' ? addDays(range.checkIn || today, 1) : today;

  // Jump to the month of the date being edited each time the sheet opens.
  useEffect(() => {
    if (open && range.ready) {
      const p = partsOf(mode === 'out' ? range.checkOut : range.checkIn, system);
      setView({ y: p.y, m: p.m });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, system]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const cells = useMemo(() => (view ? monthCells(system, view) : []), [system, view]);
  if (!open || !view || !range.ready) return null;

  const atFirstMonth = view.y * 12 + view.m <= todayParts.y * 12 + todayParts.m;

  const choose = (iso) => {
    if (iso < firstAllowed) return;
    if (mode === 'in') range.changeCheckIn(iso);
    else range.changeCheckOut(iso);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={mode === 'in' ? t('pickCheckIn') : t('pickCheckOut')} onClick={(event) => event.stopPropagation()}>
        <span className={styles.handle} aria-hidden="true" />
        <p className={styles.hint}>{mode === 'in' ? t('pickCheckIn') : t('pickCheckOut')}</p>

        <div className={styles.nav}>
          <button type="button" aria-label={t('prevMonth')} disabled={atFirstMonth} onClick={() => setView(shiftMonth(view, -1))}><Chevron /></button>
          <h2>{monthTitle(system, view, lang)}</h2>
          <button type="button" aria-label={t('nextMonth')} onClick={() => setView(shiftMonth(view, 1))}><Chevron flip /></button>
        </div>

        <div className={styles.week} aria-hidden="true">
          {WEEKDAYS[lang].map((label, i) => <span key={i}>{label}</span>)}
        </div>

        <div className={styles.grid}>
          {cells.map((cell, i) => {
            if (!cell) return <span key={`blank-${i}`} />;
            const disabled = cell.iso < firstAllowed;
            const selected = cell.iso === (mode === 'in' ? range.checkIn : range.checkOut);
            // In check-out mode the stay itself is tinted, with check-in marked as the start.
            const isAnchor = mode === 'out' && cell.iso === range.checkIn;
            const inside = mode === 'out' && cell.iso > range.checkIn && cell.iso < range.checkOut;
            const className = [styles.day, disabled && styles.past, selected && styles.edge, isAnchor && styles.anchor, inside && styles.inside, cell.iso === today && styles.today].filter(Boolean).join(' ');
            return (
              <button key={cell.iso} type="button" className={className} disabled={disabled} aria-pressed={selected} aria-label={formatDay(cell.iso, lang, true, 'persian')} onClick={() => choose(cell.iso)}>
                {formatNumber(cell.day, lang)}
              </button>
            );
          })}
        </div>

        <div className={styles.footer}>
          <p>
            <strong>{formatDay(mode === 'in' ? range.checkIn : range.checkOut, lang, true, 'persian')}</strong>
            <span>{t('nights', { n: range.nights })}</span>
          </p>
          {mode === 'in' && <button type="button" className={styles.todayButton} onClick={() => choose(today)}>{t('goToday')}</button>}
        </div>
      </div>
    </div>
  );
}
