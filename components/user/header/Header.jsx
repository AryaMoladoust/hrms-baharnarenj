'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePreferences } from '@/components/providers/Preferences';
import styles from './Header.module.css';

export default function Header({ solid = false }) {
  const { t, toggleTheme, toggleLang } = usePreferences();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const links = [
    { href: '/', label: t('navHome') },
    { href: '/rooms', label: t('navRooms') },
    { href: '/my-reservations', label: t('navMyReservations') },
    { href: '/owner/login', label: t('navOwner') },
  ];

  return (
    <header className={`${styles.header} ${solid ? styles.solid : ''}`}>
      <button className={styles.iconButton} type="button" aria-label={t('menu')} aria-expanded={open} onClick={() => setOpen(true)}>
        <span className={styles.menuIcon} aria-hidden="true"><i /><i /><i /></span>
      </button>

      <Link href="/" className={styles.brand}>{t('brand')}</Link>

      <div className={styles.actions}>
        <button className={styles.textButton} type="button" onClick={toggleLang}>{t('langShort')}</button>
        <button className={`${styles.iconButton} ${styles.lantern}`} type="button" aria-label={t('toggleTheme')} onClick={toggleTheme}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2v3M9 5h6M8 8h8l1.5 9h-11zM7 17h10M12 17v3M10 20h4" />
          </svg>
        </button>
      </div>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <nav className={styles.drawer} aria-label={t('menu')} onClick={(event) => event.stopPropagation()}>
            <button className={styles.close} type="button" onClick={() => setOpen(false)}>{t('closeMenu')}</button>
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
