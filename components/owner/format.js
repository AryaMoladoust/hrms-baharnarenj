import { getRoomBySlug } from '@/lib/rooms';
import { formatDay, formatNumber } from '@/lib/dates';

export const roomName = (slug, lang) => {
  const room = getRoomBySlug(slug);
  return room ? (lang === 'fa' ? room.name : room.nameEn) : slug;
};

// Dates in the owner panel are Jalali in both languages (same as the booking calendar).
export const day = (iso, lang, weekday = false) => formatDay(iso, lang, weekday, 'persian');
export const range = (from, to, lang) => `${day(from, lang)} – ${day(to, lang)}`;
export const money = (amount, lang, t) => `${formatNumber(amount, lang)} ${t('currency')}`;

// status -> [i18n key, chip tone]
export const STATUS = {
  paid: ['statusPaid', 'ok'],
  pending: ['statusPending', 'warn'],
  cancelled: ['statusCancelled', 'bad'],
  blocked: ['ownStatusBlocked', 'muted'],
};

export const ERROR_KEYS = {
  room_booked: 'ownErrBooked', room_booked_meanwhile: 'ownErrBooked', too_many: 'ownErrTooMany', unauthorized: 'ownErrServer',
  already_cancelled: 'ownErrAlreadyCancelled', not_pending: 'ownErrNotPending', bad_range: 'ownErrRange', not_found: 'ownErrNotFound',
};

// Turns an ApiError into a sentence: a known code, or the first field error, or a generic message.
export function errorText(error, t) {
  if (error?.code === 'validation') {
    const first = Object.values(error.fields || {})[0];
    return first ? t(first) : t('ownErrServer');
  }
  return t(ERROR_KEYS[error?.code] || 'ownErrServer');
}

export function toCsv(rows) {
  const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return `\uFEFF${rows.map((row) => row.map(cell).join(',')).join('\r\n')}`;
}

export function download(filename, text, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
