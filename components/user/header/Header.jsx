'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePreferences } from '@/components/providers/Preferences';
import styles from './Header.module.css';

const icon = (paths) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);

const ICONS = {
  home: icon(<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />),
  rooms: icon(<><path d="M5 21V10a7 7 0 0114 0v11" /><path d="M9 21v-9a3 3 0 016 0v9" /></>),
  reservations: icon(<><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" /></>),
  support: icon(<><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /><path d="M19 20a4 4 0 01-4 2h-2" /></>),
  owner: icon(<><circle cx="9" cy="14" r="4" /><path d="M12 11l8-8M17 6l3 3M15 8l2 2" /></>),
};

export default function Header({ solid = false }) {
  const { t, toggleLang } = usePreferences();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The bar is fixed to the top. Over a hero it starts transparent and turns night-green as soon as the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const links = [
    { href: '/', label: t('navHome'), icon: ICONS.home },
    { href: '/rooms', label: t('navRooms'), icon: ICONS.rooms },
    { href: '/my-reservations', label: t('navMyReservations'), icon: ICONS.reservations },
    { href: '/support', label: t('supportTitle'), icon: ICONS.support },
  ];
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <>
      <header className={`${styles.header} ${solid || scrolled ? styles.filled : ''}`}>
        <div className={styles.inner}>
          <button className={styles.iconButton} type="button" aria-label={t('menu')} aria-expanded={open} onClick={() => setOpen(true)}>
            <span className={styles.menuIcon} aria-hidden="true"><i /><i /><i /></span>
          </button>

          <Link href="/" className={styles.brand}>{t('brand')}</Link>

          <div className={styles.actions}>
            <button className={styles.textButton} type="button" onClick={toggleLang}>{t('langShort')}</button>
          </div>
        </div>
      </header>
      {solid && <div className={styles.spacer} aria-hidden="true" />}

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <nav className={styles.drawer} aria-label={t('menu')} onClick={(event) => event.stopPropagation()}>
            <div className={styles.drawerTop}>
              <div className={styles.drawerBrand}>
                <svg viewBox="0 0 40 52" width="26" height="34" aria-hidden="true"><path d="M4 50V20C4 9 11 3 20 3s16 6 16 17v30z" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M11 50V22c0-6 4-10 9-10s9 4 9 10v28" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".55" /></svg>
                <div><strong>{t('brand')}</strong><span>{t('menuTagline')}</span></div>
              </div>
              <button className={styles.close} type="button" aria-label={t('closeMenu')} onClick={() => setOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <ul className={styles.links}>
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={isActive(link.href) ? styles.linkActive : styles.link} aria-current={isActive(link.href) ? 'page' : undefined} onClick={() => setOpen(false)}>
                    <span className={styles.linkIcon}>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.drawerBottom}>
              <Link href="/owner/login" className={styles.owner} onClick={() => setOpen(false)}>
                <span className={styles.linkIcon}>{ICONS.owner}</span>
                <span><strong>{t('navOwner')}</strong><small>{t('menuOwnerHint')}</small></span>
              </Link>
              <button type="button" className={styles.langButton} onClick={toggleLang}>{t('switchLang')}</button>
            </div>
            <span className={styles.edge} aria-hidden="true" />
          </nav>
        </div>
      )}
    </>
  );
}
