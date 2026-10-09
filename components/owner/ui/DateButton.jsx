'use client';

import { useState } from 'react';
import DatePickerSheet from '@/components/owner/ui/DatePickerSheet';
import { usePreferences } from '@/components/providers/Preferences';
import { formatDay } from '@/lib/dates';
import styles from './DateButton.module.css';

// A field that shows a Jalali date and opens the calendar. onChange gets 'YYYY-MM-DD'.
export default function DateButton({ label, value, min, max, onChange, error }) {
  const { lang } = usePreferences();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`${styles.button} ${error ? styles.invalid : ''}`} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span>{label}</span>
        <strong>{value ? formatDay(value, lang, true, 'persian') : '…'}</strong>
      </button>
      {error && <em className={styles.error} role="alert">{error}</em>}
      <DatePickerSheet open={open} value={value} min={min} max={max} title={label} onPick={onChange} onClose={() => setOpen(false)} />
    </>
  );
}
