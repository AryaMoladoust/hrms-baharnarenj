import { toJalali, toGregorian, jalaliMonthLength } from '@/lib/jalali';
import { fromInputDate } from '@/lib/dates';

// The calendar widget is always Jalali (also in English). The app stores plain Gregorian ISO strings ('YYYY-MM-DD') internally.
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

export const systemFor = () => 'jalali';

// Saturday first, as in the Persian calendar.
export const WEEKDAYS = {
  fa: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  en: ['S', 'S', 'M', 'T', 'W', 'T', 'F'],
};

export function partsOf(iso, system) {
  const [y, m, d] = iso.split('-').map(Number);
  if (system === 'jalali') return toJalali(y, m, d);
  return { y, m, d };
}

export function isoFromParts(system, { y, m, d }) {
  if (system === 'jalali') {
    const g = toGregorian(y, m, d);
    return isoOf(g.y, g.m, g.d);
  }
  return isoOf(y, m, d);
}

export function monthLength(system, y, m) {
  return system === 'jalali' ? jalaliMonthLength(y, m) : new Date(y, m, 0).getDate();
}

export function shiftMonth({ y, m }, delta) {
  const index = y * 12 + (m - 1) + delta;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
}

export function monthTitle(system, { y, m }, lang) {
  const locale = lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US-u-ca-persian';
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(fromInputDate(isoFromParts(system, { y, m, d: 1 })));
}

// Leading nulls pad the first week (Saturday-first for Jalali, Sunday-first for Gregorian).
export function monthCells(system, { y, m }) {
  const dow = fromInputDate(isoFromParts(system, { y, m, d: 1 })).getDay();
  const lead = system === 'jalali' ? (dow + 1) % 7 : dow;
  const days = Array.from({ length: monthLength(system, y, m) }, (_, i) => ({ day: i + 1, iso: isoFromParts(system, { y, m, d: i + 1 }) }));
  return [...Array(lead).fill(null), ...days];
}
