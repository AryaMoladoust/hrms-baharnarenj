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

// Month calendar in a bottom sheet (phones) or centered dialog (desktop). Jalali for Persian, Gregorian for English.
export default function DateRangeSheet({ open, picking, onPicking, range, onClose }) {
  const { t, lang } = usePreferences();
  const system = systemFor(lang);
  const today = toInputDate(new Date());
  const todayParts = partsOf(today, system);
  const [view, setView] = useState(null);

  // Jump to the month being edited each time the sheet opens.
  useEffect(() => {
    if (open && range.ready) {
      const p = partsOf(picking === 'out' ? range.checkOut : range.checkIn, system);
      setView({ y: p.y, m: p.m });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, system]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const cells = useMemo(() => (view ? monthCells(system, view) : []), [system, view]);
  if (!open || !view) return null;

  const atFirstMonth = view.y * 12 + view.m <= todayParts.y * 12 + todayParts.m;

  const choose = (iso) => {
    if (iso < today) return;
    if (picking === 'out' && iso > range.checkIn) {
      range.changeCheckOut(iso);
      onClose();
      return;
    }
    range.changeCheckIn(iso);
    range.changeCheckOut(addDays(iso, 1));
    onPicking('out');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={t('selectDates')} onClick={(event) => event.stopPropagation()}>
        <span className={styles.handle} aria-hidden="true" />
        <p className={styles.hint}>{picking === 'in' ? t('pickCheckIn') : t('pickCheckOut')}</p>

        <div className={styles.nav}>
          <button type="button" aria-label={t('prevMonth')} disabled={atFirstMonth} onClick={() => setView(shiftMonth(view, -1))}><Chevron /></button>
          <h2>{monthTitle(system, view, lang)}</h2>
          <button type="button" aria-label={t('nextMonth')} onClick={() => setView(shiftMonth(view, 1))}><Chevron flip /></button>
        </div>

        <div className={styles.week} aria-hidden="true">
          {WEEKDAYS[system].map((label, i) => <span key={i}>{label}</span>)}
        </div>

        <div className={styles.grid}>
          {cells.map((cell, i) => {
            if (!cell) return <span key={`blank-${i}`} />;
            const past = cell.iso < today;
            const isStart = cell.iso === range.checkIn;
            const isEnd = cell.iso === range.checkOut;
            const inside = cell.iso > range.checkIn && cell.iso < range.checkOut;
            const className = [styles.day, past && styles.past, (isStart || isEnd) && styles.edge, inside && styles.inside, cell.iso === today && styles.today].filter(Boolean).join(' ');
            return (
              <button key={cell.iso} type="button" className={className} disabled={past} aria-pressed={isStart || isEnd} aria-label={formatDay(cell.iso, lang, true)} onClick={() => choose(cell.iso)}>
                {formatNumber(cell.day, lang)}
              </button>
            );
          })}
        </div>

        <div className={styles.footer}>
          <p>
            <strong>{formatDay(range.checkIn, lang)} – {formatDay(range.checkOut, lang)}</strong>
            <span>{t('nights', { n: range.nights })}</span>
          </p>
          <button type="button" className={styles.todayButton} onClick={() => setView({ y: todayParts.y, m: todayParts.m })}>{t('goToday')}</button>
          <button type="button" className={styles.doneButton} onClick={onClose}>{t('done')}</button>
        </div>
      </div>
    </div>
  );
}
