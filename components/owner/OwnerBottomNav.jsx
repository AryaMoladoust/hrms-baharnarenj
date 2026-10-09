'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePreferences } from '@/components/providers/Preferences';
import { icon } from '@/components/owner/ui/Kit';
import styles from './OwnerBottomNav.module.css';

// Order on screen (first = right in Persian, left in English). The dashboard is the middle one, like Home in the guest app.
const ITEMS = [
  { href: '/owner/reservations', label: 'ownNavReservations', icon: icon(<><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" /></>, 24) },
  { href: '/owner/rooms', label: 'ownNavRooms', icon: icon(<><path d="M5 21V10a7 7 0 0114 0v11" /><path d="M9 21v-9a3 3 0 016 0v9" /></>, 24) },
  { href: '/owner/dashboard', label: 'ownNavDashboard', icon: icon(<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />, 24) },
  { href: '/owner/finance', label: 'ownNavFinance', icon: icon(<><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></>, 24) },
  { href: '/owner/more', label: 'ownNavMore', icon: icon(<><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>, 24) },
];

function activeIndex(pathname) {
  if (pathname.startsWith('/owner/reservations')) return 0;
  if (pathname.startsWith('/owner/rooms')) return 1;
  if (pathname.startsWith('/owner/dashboard')) return 2;
  if (pathname.startsWith('/owner/finance') || pathname.startsWith('/owner/expenses') || pathname.startsWith('/owner/reports')) return 3;
  return 4; // more, pricing, notifications, account
}

// Same night-green bar with a round notch and an amber bubble as the guest app, with five items.
export default function OwnerBottomNav() {
  const { t } = usePreferences();
  const active = activeIndex(usePathname() || '');
  return (
    <>
      <nav className={styles.nav} aria-label={t('ownNavLabel')} style={{ '--nav-i': active }}>
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
