'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePreferences } from '@/components/providers/Preferences';
import { monthCells, monthTitle, partsOf, shiftMonth, systemFor, WEEKDAYS } from '@/lib/calendar';
import { formatDay, formatNumber, toInputDate } from '@/lib/dates';
import styles from '@/components/user/booking/DateRangeSheet.module.css';

const Chevron = ({ flip }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={flip ? styles.flip : undefined}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

// One Jalali calendar that picks one day (same look as the guest booking calendar). min / max are 'YYYY-MM-DD' limits (optional).
export default function DatePickerSheet({ open, value, min, max, title, onPick, onClose }) {
  const { t, lang } = usePreferences();
  const system = systemFor(lang);
  const today = toInputDate(new Date());
  const [view, setView] = useState(null);

  useEffect(() => {
    if (open) {
      const p = partsOf(value || today, system);
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

  const disabled = (iso) => (min && iso < min) || (max && iso > max);

  return (
    <div className={styles.overlay} style={{ zIndex: 80 }} onClick={onClose}>
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <span className={styles.handle} aria-hidden="true" />
        <p className={styles.hint}>{title}</p>
        <div className={styles.nav}>
          <button type="button" aria-label={t('prevMonth')} onClick={() => setView(shiftMonth(view, -1))}><Chevron /></button>
          <h2>{monthTitle(system, view, lang)}</h2>
          <button type="button" aria-label={t('nextMonth')} onClick={() => setView(shiftMonth(view, 1))}><Chevron flip /></button>
        </div>
        <div className={styles.week} aria-hidden="true">{WEEKDAYS[lang].map((label, i) => <span key={i}>{label}</span>)}</div>
        <div className={styles.grid}>
          {cells.map((cell, i) => {
            if (!cell) return <span key={`blank-${i}`} />;
            const off = disabled(cell.iso);
            const className = [styles.day, off && styles.past, cell.iso === value && styles.edge, cell.iso === today && styles.today].filter(Boolean).join(' ');
            return (
              <button key={cell.iso} type="button" className={className} disabled={off} aria-pressed={cell.iso === value} aria-label={formatDay(cell.iso, lang, true, 'persian')} onClick={() => { onPick(cell.iso); onClose(); }}>
                {formatNumber(cell.day, lang)}
              </button>
            );
          })}
        </div>
        <div className={styles.footer}>
          <p><strong>{value ? formatDay(value, lang, true, 'persian') : ''}</strong></p>
          <button type="button" className={styles.todayButton} disabled={disabled(today)} onClick={() => { onPick(today); onClose(); }}>{t('goToday')}</button>
        </div>
      </div>
    </div>
  );
}
