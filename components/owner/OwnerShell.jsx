'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import OwnerBottomNav from '@/components/owner/OwnerBottomNav';
import { icon } from '@/components/owner/ui/Kit';
import { notificationText } from '@/components/owner/notificationText';
import { usePreferences } from '@/components/providers/Preferences';
import { ownerFetch } from '@/lib/owner/client';
import styles from './OwnerShell.module.css';

const OwnerContext = createContext({ owner: null, unread: 0, refresh: () => {}, toast: () => {} });
export const useOwner = () => useContext(OwnerContext);

const POLL_MS = 30000;

/**
 * Frame of every owner page: fixed night-green top bar (title, bell with unread count, account), bottom navigation,
 * and a 30-second check for new notifications. A new paid reservation pops up as a message (and as a phone/browser
 * notification if the owner allowed it); closed-app notifications come from Web Push (see lib/push.js).
 */
export default function OwnerShell({ title, children }) {
  const { t, lang } = usePreferences();
  const [owner, setOwner] = useState(null);
  const [unread, setUnread] = useState(0);
  const [message, setMessage] = useState(null);
  const known = useRef(null);
  const timer = useRef(null);

  const toast = useCallback((text, tone = 'ok') => {
    setMessage({ text, tone, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 6000);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await ownerFetch('notifications');
      setUnread(data.unread);
      const ids = new Set(data.notifications.map((n) => n.id));
      if (known.current) {
        const fresh = data.notifications.filter((n) => !known.current.has(n.id) && !n.read);
        if (fresh.length) {
          const { title: head, body } = notificationText(fresh[0], t, lang);
          toast(`${head}: ${body}`, 'info');
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) new Notification(head, { body, dir: lang === 'fa' ? 'rtl' : 'ltr' });
        }
      }
      known.current = ids;
    } catch { /* a failed check is retried in 30 s */ }
  }, [t, lang, toast]);

  useEffect(() => {
    ownerFetch('me').then((data) => setOwner(data.owner)).catch(() => {});
    refresh();
    const id = setInterval(refresh, POLL_MS);
    const onVisible = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); clearTimeout(timer.current); };
  }, [refresh]);

  const value = useMemo(() => ({ owner, unread, setUnread, refresh, toast }), [owner, unread, refresh, toast]);
  const initial = (owner?.displayName || owner?.username || '·').slice(0, 1).toUpperCase();

  return (
    <OwnerContext.Provider value={value}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.inner}>
            <div className={styles.titleBlock}>
              <span>{t('ownPanel')}</span>
              <h1>{title}</h1>
            </div>
            <div className={styles.tools}>
              <Link href="/owner/notifications" className={styles.iconLink} aria-label={t('ownNotifications')}>
                {icon(<><path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15z" /><path d="M10 21a2 2 0 004 0" /></>)}
                {unread > 0 && <b className={styles.badge}>{unread > 9 ? '9+' : unread}</b>}
              </Link>
              <Link href="/owner/account" className={styles.avatar} aria-label={t('ownAccount')}>{initial}</Link>
            </div>
          </div>
        </header>
        <div className={styles.spacer} aria-hidden="true" />

        <main className={styles.content}>
          {owner?.mustChangePassword && (
            <Link href="/owner/account" className={styles.warning}>
              <strong>{t('ownDefaultPassTitle')}</strong>
              <span>{t('ownDefaultPassBody')}</span>
            </Link>
          )}
          {children}
        </main>

        {message && (
          <Link href="/owner/reservations" className={styles.toast} data-tone={message.tone} role="status">{message.text}</Link>
        )}
        <OwnerBottomNav />
      </div>
    </OwnerContext.Provider>
  );
}
