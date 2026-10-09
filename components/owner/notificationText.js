import { getRoomBySlug } from '@/lib/rooms';
import { formatDay, formatNumber } from '@/lib/dates';

// Turns a stored notification ({ type, data }) into the sentence shown to the owner, in the current language.
export function notificationText(notification, t, lang) {
  const { type, data } = notification;
  const room = getRoomBySlug(data.roomSlug);
  const roomName = lang === 'fa' ? room?.name : room?.nameEn;
  const dates = `${formatDay(data.checkIn, lang, false, 'persian')} – ${formatDay(data.checkOut, lang, false, 'persian')}`;
  const money = `${formatNumber(data.total || 0, lang)} ${t('currency')}`;
  const titleKey = { reservation_paid: 'ownNotifPaid', reservation_manual: 'ownNotifManual', reservation_cancelled: 'ownNotifCancelled' }[type] || 'ownNotifPaid';
  return {
    title: t(titleKey),
    body: `${data.guestName || ''} · ${roomName || ''} · ${dates}${type === 'reservation_cancelled' ? '' : ` · ${money}`}`,
    by: data.by || '',
  };
}
