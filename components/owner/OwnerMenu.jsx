'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { icon } from '@/components/owner/ui/Kit';
import { usePreferences } from '@/components/providers/Preferences';
import { formatNumber } from '@/lib/dates';
import { ownerFetch } from '@/lib/owner/client';
import menu from '@/components/user/header/Header.module.css'; // the very same menu look as the guest site
import styles from './OwnerMenu.module.css';

const LINKS = [
  { href: '/owner/dashboard', label: 'ownNavDashboard', icon: icon(<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />) },
  { href: '/owner/reservations', label: 'ownNavReservations', icon: icon(<><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" /></>) },
  { href: '/owner/rooms', label: 'ownNavRooms', icon: icon(<><path d="M5 21V10a7 7 0 0114 0v11" /><path d="M9 21v-9a3 3 0 016 0v9" /></>) },
  { href: '/owner/pricing', label: 'ownPricing', icon: icon(<><path d="M20 12l-8 8-9-9V3h8z" /><circle cx="7.5" cy="7.5" r="1.3" /></>) },
  { href: '/owner/notifications', label: 'ownNotifications', badge: true, icon: icon(<><path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15z" /><path d="M10 21a2 2 0 004 0" /></>) },
  { href: '/owner/account', label: 'ownAccount', icon: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>) },
  // Finance is not part of this version (lib/owner/features.js). Its entry was here:
  // { href: '/owner/finance', label: 'ownNavFinance', icon: icon(<path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />) },
];

/**
 * The hamburger menu of the owner panel: every page of the panel, the website, language and sign-out.
 * It reuses the guest site's menu styles, so both menus look and behave the same (slides in, Escape or a tap outside closes it).
 */
export default function OwnerMenu({ open, onClose, unread }) {
  const { t, lang, toggleLang } = usePreferences();
  const pathname = usePathname() || '';
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const isActive = (href) => pathname.startsWith(href);
  const logout = async () => { await ownerFetch('logout', { method: 'POST' }).catch(() => {}); window.location.href = '/owner/login'; };

  return (
    <div className={menu.overlay} onClick={onClose}>
      <nav className={menu.drawer} aria-label={t('menu')} onClick={(event) => event.stopPropagation()}>
        <div className={menu.drawerTop}>
          <div className={menu.drawerBrand}>
            <svg viewBox="0 0 40 52" width="26" height="34" aria-hidden="true"><path d="M4 50V20C4 9 11 3 20 3s16 6 16 17v30z" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M11 50V22c0-6 4-10 9-10s9 4 9 10v28" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".55" /></svg>
            <div><strong>{t('brand')}</strong><span>{t('ownPanel')}</span></div>
          </div>
          <button ref={closeRef} className={menu.close} type="button" aria-label={t('closeMenu')} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <ul className={menu.links}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={isActive(link.href) ? menu.linkActive : menu.link} aria-current={isActive(link.href) ? 'page' : undefined} onClick={onClose}>
                <span className={menu.linkIcon}>{link.icon}</span>
                <span>{t(link.label)}</span>
                {link.badge && unread > 0 && <b className={styles.badge}>{formatNumber(unread, lang)}</b>}
              </Link>
            </li>
          ))}
        </ul>

        <div className={menu.drawerBottom}>
          <Link href="/" className={menu.owner} onClick={onClose}>
            <span className={menu.linkIcon}>{icon(<><path d="M5 21V10a7 7 0 0114 0v11" /><path d="M9 21v-9a3 3 0 016 0v9" /></>)}</span>
            <span><strong>{t('ownViewSite')}</strong><small>{t('ownViewSiteHint')}</small></span>
          </Link>
          <button type="button" className={menu.langButton} onClick={toggleLang}>{t('switchLang')}</button>
          <button type="button" className={styles.logout} onClick={logout}>{t('ownLogout')}</button>
        </div>
        <span className={menu.edge} aria-hidden="true" />
      </nav>
    </div>
  );
}
