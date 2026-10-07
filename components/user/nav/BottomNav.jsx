'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePreferences } from '@/components/providers/Preferences';
import styles from './BottomNav.module.css';

const icon = (paths) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);

// Order = order on screen (first item is on the right in Persian, on the left in English).
const ITEMS = [
  { href: '/', label: 'navHome', icon: icon(<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />) },
  { href: '/rooms', label: 'navRooms', icon: icon(<><path d="M5 21V10a7 7 0 0114 0v11" /><path d="M9 21v-9a3 3 0 016 0v9" /></>) },
  { href: '/my-reservations', label: 'navMyReservations', icon: icon(<><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" /></>) },
];

// Only the three main pages show the bar. Room detail and booking have their own bottom action bar, and owner pages are separate.
function activeIndex(pathname) {
  if (pathname === '/') return 0;
  if (pathname === '/rooms') return 1;
  if (pathname === '/my-reservations') return 2;
  return -1;
}

/**
 * Mobile bottom navigation: a night-green bar with a round notch. The amber bubble sits in the notch above the current page
 * and slides to the next one when the page changes (the notch is a CSS mask driven by --nav-i, registered in globals.css).
 * Hidden on desktop, where the header menu is used.
 */
export default function BottomNav() {
  const { t } = usePreferences();
  const active = activeIndex(usePathname());
  if (active < 0) return null;

  return (
    <>
      <nav className={styles.nav} aria-label={t('bottomNavLabel')} style={{ '--nav-i': active }}>
        <div className={styles.bar} aria-hidden="true" />
        <span className={styles.bubble} aria-hidden="true" />
        <ul className={styles.items}>
          {ITEMS.map((item, i) => (
            <li key={item.href}>
              <Link href={item.href} className={i === active ? styles.itemActive : styles.item} aria-current={i === active ? 'page' : undefined}>
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{t(item.label)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.spacer} aria-hidden="true" />
    </>
  );
}
