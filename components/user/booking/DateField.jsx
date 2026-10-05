'use client';

import { formatDay } from '@/lib/dates';
import styles from './DateField.module.css';

export default function DateField({ id, label, hint, value, min, onChange, lang }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <strong>{value ? formatDay(value, lang, true) : '…'}</strong>
      <span>{hint}</span>
      {/* Native picker sits invisibly on top: one tap opens the phone's date sheet. */}
      <input id={id} type="date" value={value} min={min} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
