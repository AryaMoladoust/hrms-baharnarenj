'use client';

import { formatDay } from '@/lib/dates';
import styles from './DateField.module.css';

// A tappable card showing one date. Opens the shared calendar sheet.
export default function DateField({ label, hint, value, onOpen, lang }) {
  return (
    <button type="button" className={styles.field} onClick={onOpen} aria-haspopup="dialog">
      <span className={styles.label}>{label}</span>
      <strong>{value ? formatDay(value, lang, true) : '…'}</strong>
      <span className={styles.hint}>{hint}</span>
    </button>
  );
}
