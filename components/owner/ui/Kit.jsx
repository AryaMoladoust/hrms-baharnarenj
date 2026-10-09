'use client';

import styles from './Kit.module.css';

// Small building blocks shared by every owner page, so the whole panel looks like one product.

export const icon = (paths, size = 22) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);

export function Card({ title, iconNode, action, tone, children, className = '' }) {
  return (
    <section className={`${styles.card} ${tone === 'night' ? styles.night : ''} ${className}`}>
      {(title || action) && (
        <header className={styles.cardHead}>
          <h2>{iconNode && <span className={styles.cardIcon}>{iconNode}</span>}{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

// tone: ok | warn | bad | muted | info
export function Chip({ tone = 'muted', children }) {
  return <span className={styles.chip} data-tone={tone}>{children}</span>;
}

export function Button({ variant = 'primary', busy, children, ...props }) {
  return <button type="button" className={`${styles.btn} ${styles[variant]}`} disabled={busy || props.disabled} {...props}>{children}</button>;
}

export function Field({ label, error, hint, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint && !error && <small>{hint}</small>}
      {error && <em role="alert">{error}</em>}
    </label>
  );
}

export function Segmented({ value, options, onChange, ariaLabel }) {
  return (
    <div className={styles.segmented} role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button key={option.value} type="button" role="tab" aria-selected={value === option.value} className={value === option.value ? styles.segOn : styles.seg} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }) {
  return <p className={styles.empty}>{children}</p>;
}

export function Loading() {
  return <div className={styles.loading} aria-busy="true"><i /><i /><i /></div>;
}

export function ErrorNote({ children, onRetry, retryLabel }) {
  return (
    <div className={styles.error} role="alert">
      <p>{children}</p>
      {onRetry && <button type="button" onClick={onRetry}>{retryLabel}</button>}
    </div>
  );
}

// A room's season color as a small round dot (the same colors as the guest-facing room cards).
export function RoomDot({ slug }) {
  return <span className={styles.dot} data-room={slug} aria-hidden="true" />;
}
