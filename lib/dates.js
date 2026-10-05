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

// Persian users see the Jalali calendar, English users the Gregorian one.
export function formatDay(value, lang, withWeekday = false) {
  const locale = lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    ...(withWeekday ? { weekday: 'long' } : {}),
  }).format(fromInputDate(value));
}

export function formatNumber(value, lang) {
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(value);
}
