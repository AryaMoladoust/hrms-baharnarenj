'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OwnerShell, { useOwner } from '@/components/owner/OwnerShell';
import { Button, Card, Empty, ErrorNote, Loading } from '@/components/owner/ui/Kit';
import { useOwnerData } from '@/components/owner/useOwnerData';
import { notificationText } from '@/components/owner/notificationText';
import { day } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { ownerFetch } from '@/lib/owner/client';
import styles from './NotificationsView.module.css';

function urlBase64ToUint8Array(base64) {
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

// Phone / browser notifications even when the panel is closed (Web Push). Needs the keys described in lib/push.js.
function PushCard() {
  const { t } = usePreferences();
  const { toast } = useOwner();
  const [info, setInfo] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  useEffect(() => {
    ownerFetch('push').then(setInfo).catch(() => setInfo({ enabled: false }));
    if (supported) navigator.serviceWorker.getRegistration('/owner-sw.js').then((reg) => reg?.pushManager.getSubscription()).then((sub) => setSubscribed(Boolean(sub))).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { toast(t('ownPushDenied'), 'bad'); setBusy(false); return; }
      const reg = await navigator.serviceWorker.register('/owner-sw.js');
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(info.publicKey) }));
      await ownerFetch('push', { method: 'POST', body: { subscription: sub.toJSON() } });
      setSubscribed(true);
      toast(t('ownPushOn'));
    } catch { toast(t('ownErrServer'), 'bad'); }
    setBusy(false);
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/owner-sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) { await ownerFetch('push', { method: 'DELETE', body: { endpoint: sub.endpoint } }); await sub.unsubscribe(); }
      setSubscribed(false);
    } catch { /* ignore */ }
    setBusy(false);
  };

  const askLocal = async () => { const p = await Notification.requestPermission(); toast(p === 'granted' ? t('ownPushOn') : t('ownPushDenied'), p === 'granted' ? 'ok' : 'bad'); };

  if (!info) return null;
  return (
    <Card title={t('ownPushTitle')}>
      <p className={styles.help}>{info.enabled ? t('ownPushHelp') : t('ownPushHelpLocal')}</p>
      {!supported && <p className={styles.help}>{t('ownPushUnsupported')}</p>}
      {supported && info.enabled && (subscribed
        ? <Button variant="ghost" busy={busy} onClick={disable}>{t('ownPushDisable')}</Button>
        : <Button variant="primary" busy={busy} onClick={enable}>{t('ownPushEnable')}</Button>)}
      {supported && !info.enabled && Notification.permission !== 'granted' && <Button variant="ghost" onClick={askLocal}>{t('ownPushAllowLocal')}</Button>}
    </Card>
  );
}

function Body() {
  const { t, lang } = usePreferences();
  const { setUnread, refresh } = useOwner();
  const { data, error, loading, reload } = useOwnerData('notifications');

  const markRead = async (ids) => {
    const res = await ownerFetch('notifications', { method: 'POST', body: ids ? { ids } : {} }).catch(() => null);
    if (res) { setUnread(res.unread); reload(); refresh(); }
  };

  return (
    <>
      <PushCard />
      {loading && !data && <Loading />}
      {error && !data && <ErrorNote onRetry={reload} retryLabel={t('ownRetry')}>{t('ownErrServer')}</ErrorNote>}
      {data && (
        <Card title={t('ownNotifications')} action={data.unread > 0 && <button type="button" className={styles.markAll} onClick={() => markRead(null)}>{t('ownMarkAllRead')}</button>}>
          {data.notifications.length === 0 ? <Empty>{t('ownNoNotifications')}</Empty> : (
            <ul className={styles.list}>
              {data.notifications.map((n) => {
                const text = notificationText(n, t, lang);
                return (
                  <li key={n.id} data-unread={!n.read}>
                    <Link href={`/owner/reservations?q=${encodeURIComponent(n.data.code || '')}`} onClick={() => !n.read && markRead([n.id])}>
                      <strong>{text.title}</strong>
                      <span>{text.body}</span>
                      <small>{day(n.createdAt.slice(0, 10), lang)} · {new Date(n.createdAt).toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' })}{text.by ? ` · ${text.by}` : ''}</small>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}

export default function NotificationsView() {
  const { t } = usePreferences();
  return <OwnerShell title={t('ownNotifications')}><Body /></OwnerShell>;
}
