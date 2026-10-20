import styles from './Skeleton.module.css';

/**
 * Grey placeholder block with a light sweep running across it, like the loading rows in Telegram.
 * Shown where text, prices or pictures will appear, so the page keeps its shape and nothing jumps when the real data arrives.
 * w / h: number (px) or any CSS size. r: number (px), 'pill' or 'circle'. Color follows the surrounding text color,
 * so the same block works on light and on dark cards. The sweep stops for visitors who prefer reduced motion (see globals.css).
 */
export function Skeleton({ w = '100%', h = 14, r = 8, className = '' }) {
  const size = (v) => (typeof v === 'number' ? `${v}px` : v);
  const radius = r === 'pill' ? '999px' : r === 'circle' ? '50%' : size(r);
  return <span className={`${styles.sk} ${className}`} style={{ width: size(w), height: size(h), borderRadius: radius }} aria-hidden="true" />;
}

// Wraps a group of Skeleton blocks so screen readers hear "loading" once instead of reading empty shapes.
export function SkeletonGroup({ label, className = '', children, ...rest }) {
  return <div className={className} role="status" aria-busy="true" aria-label={label} {...rest}>{children}</div>;
}
