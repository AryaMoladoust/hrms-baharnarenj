import { addDays, fromInputDate } from '@/lib/dates';
import { isoFromParts, monthLength, partsOf } from '@/lib/calendar';

// All dates in the owner panel are plain 'YYYY-MM-DD' strings (calendar days, Tehran time). No timezone math on stored values.
const pad = (n) => String(n).padStart(2, '0');

export const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value) {
  if (typeof value !== 'string' || !ISO_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

// Today in Tehran (UTC+3:30, no daylight saving), as 'YYYY-MM-DD'.
export function todayTehran(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function daysBetween(from, to) {
  return Math.round((fromInputDate(to) - fromInputDate(from)) / 86400000);
}

// Inclusive list of days from..to.
export function eachDay(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function jalaliMonthKey(iso) {
  const { y, m } = partsOf(iso, 'jalali');
  return `${y}-${pad(m)}`;
}

export function jalaliMonthBounds(iso) {
  const { y, m } = partsOf(iso, 'jalali');
  return { y, m, from: isoFromParts('jalali', { y, m, d: 1 }), to: isoFromParts('jalali', { y, m, d: monthLength('jalali', y, m) }) };
}

// Persian weeks start on Saturday.
export function jalaliWeekBounds(iso) {
  const dow = fromInputDate(iso).getDay(); // 0 = Sunday
  const from = addDays(iso, -((dow + 1) % 7));
  return { from, to: addDays(from, 6) };
}

// The current Jalali month and the previous ones, newest first: [{ y, m, from, to }]
export function recentJalaliMonths(count, todayIso) {
  const out = [];
  let { y, m } = partsOf(todayIso, 'jalali');
  for (let i = 0; i < count; i += 1) {
    out.push({ y, m, from: isoFromParts('jalali', { y, m, d: 1 }), to: isoFromParts('jalali', { y, m, d: monthLength('jalali', y, m) }) });
    m -= 1;
    if (m < 1) { m = 12; y -= 1; }
  }
  return out;
}
