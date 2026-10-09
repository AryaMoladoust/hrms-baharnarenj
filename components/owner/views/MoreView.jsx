'use client';

import Link from 'next/link';
import OwnerShell, { useOwner } from '@/components/owner/OwnerShell';
import { Card, icon } from '@/components/owner/ui/Kit';
import { usePreferences } from '@/components/providers/Preferences';
import { ownerFetch } from '@/lib/owner/client';
import { formatNumber } from '@/lib/dates';
import styles from './MoreView.module.css';

function Body() {
  const { t, lang, toggleLang } = usePreferences();
  const { unread } = useOwner();
  const logout = async () => { await ownerFetch('logout', { method: 'POST' }).catch(() => {}); window.location.href = '/owner/login'; };

  const items = [
    { href: '/owner/pricing', label: t('ownPricing'), hint: t('ownPricingHint'), icon: icon(<><path d="M20 12l-8 8-9-9V3h8z" /><circle cx="7.5" cy="7.5" r="1.3" /></>) },
    { href: '/owner/notifications', label: t('ownNotifications'), hint: t('ownNotificationsHint'), badge: unread, icon: icon(<><path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15z" /><path d="M10 21a2 2 0 004 0" /></>) },
    { href: '/owner/account', label: t('ownAccount'), hint: t('ownAccountHint'), icon: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>) },
    { href: '/', label: t('ownViewSite'), hint: t('ownViewSiteHint'), icon: icon(<><path d="M5 21V10a7 7 0 0114 0v11" /><path d="M9 21v-9a3 3 0 016 0v9" /></>) },
  ];

  return (
    <>
      <ul className={styles.menu}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.text}><strong>{item.label}</strong><small>{item.hint}</small></span>
              {item.badge > 0 && <b className={styles.badge}>{formatNumber(item.badge, lang)}</b>}
            </Link>
          </li>
        ))}
      </ul>
      <Card>
        <div className={styles.buttons}>
          <button type="button" onClick={toggleLang}>{t('switchLang')}</button>
          <button type="button" className={styles.logout} onClick={logout}>{t('ownLogout')}</button>
        </div>
      </Card>
    </>
  );
}

export default function MoreView() {
  const { t } = usePreferences();
  return <OwnerShell title={t('ownNavMore')}><Body /></OwnerShell>;
}
