export function toInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parse 'YYYY-MM-DD' at local noon so timezones never shift the day.
export function fromInputDate(value) {
  return new Date(`${value}T12:00:00`);
}

export function addDays(value, days) {
  const date = fromInputDate(value);
  date.setDate(date.getDate() + days);
  return toInputDate(date);
}

export function nightsBetween(checkIn, checkOut) {
  return Math.max(1, Math.round((fromInputDate(checkOut) - fromInputDate(checkIn)) / 86400000));
}

// calendar: 'persian' | 'gregorian'. Default follows the language; the date widget forces 'persian' in both languages.
export function formatDay(value, lang, withWeekday = false, calendar = lang === 'fa' ? 'persian' : 'gregorian') {
  const locale = lang === 'fa' ? `fa-IR-u-ca-${calendar}` : calendar === 'persian' ? 'en-US-u-ca-persian' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    ...(withWeekday ? { weekday: 'long' } : {}),
  }).format(fromInputDate(value));
}

// Small Gregorian line shown under Jalali dates for English visitors, e.g. "4 Oct 2026".
export function formatGregorianShort(value) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(fromInputDate(value));
}

export function formatNumber(value, lang) {
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(value);
}
