import styles from './NightDots.module.css';

/**
 * One dot per night of the stay: filled = free, hollow = taken. Only for short stays (2 to 7 nights), where the dots fit
 * on a room card; longer stays are described by the "x of y nights" text alone.
 */
export default function NightDots({ nights, label }) {
  if (!nights || nights.length < 2 || nights.length > 7) return null;
  return (
    <span className={styles.dots} role="img" aria-label={label}>
      {nights.map((night) => <i key={night.date} className={night.free ? styles.free : styles.busy} />)}
    </span>
  );
}
