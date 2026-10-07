'use client';

import { formatDay, formatGregorianShort } from '@/lib/dates';
import styles from './DateField.module.css';

// A tappable card showing one date (Jalali in both languages; English also gets the Gregorian date underneath).
export default function DateField({ label, hint, value, onOpen, lang }) {
  return (
    <button type="button" className={styles.field} onClick={onOpen} aria-haspopup="dialog">
      <span className={styles.label}>{label}</span>
      <strong>{value ? formatDay(value, lang, true, 'persian') : '…'}</strong>
      {lang === 'en' && value && <span className={styles.sub}>{formatGregorianShort(value)}</span>}
      <span className={styles.hint}>{hint}</span>
    </button>
  );
}
