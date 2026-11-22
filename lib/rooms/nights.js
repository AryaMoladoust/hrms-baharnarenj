import { addDays } from '../dates';
import { isActive } from '../owner/overlap';

/**
 * Night-by-night availability of one room. A "night" is named by the day it starts on (the check-out day is not a night),
 * so a stay from the 19th to the 21st has two nights: the 19th and the 20th. Pure functions, no database here.
 */
const GUARD = 400; // no stay or window is ever longer; protects against a bad date range looping for ages
export const DOT_LIMIT = 31; // the per-night list is only sent for stays up to this many nights
export const LOOKAHEAD_DAYS = 90; // how far past check-out we look for the next free night

export function eachNight(from, to) {
  const list = [];
  for (let d = from; d < to && list.length < GUARD; d = addDays(d, 1)) list.push(d);
  return list;
}

// The set of taken nights of one room inside [from, to), from the reservations that currently hold it.
export function busyNights(reservations, slug, from, to, nowMs) {
  const busy = new Set();
  for (const r of reservations) {
    if (r.roomSlug !== slug || !isActive(r, nowMs)) continue;
    const start = r.checkIn > from ? r.checkIn : from;
    const end = r.checkOut < to ? r.checkOut : to;
    for (const night of eachNight(start, end)) busy.add(night);
  }
  return busy;
}

/**
 * What the guest needs to know about one stay: free (every night), partial (some nights) or booked (none).
 * freeRuns = the free stretches inside the stay as ready-to-book stays { from, to, nights }, longest first.
 */
export function describeStay(busy, checkIn, checkOut) {
  const nights = eachNight(checkIn, checkOut).map((date) => ({ date, free: !busy.has(date) }));
  const total = nights.length;
  const freeNights = nights.filter((n) => n.free).length;
  const status = freeNights === total ? 'free' : freeNights === 0 ? 'booked' : 'partial';

  const runs = [];
  let run = null;
  for (const n of nights) {
    if (n.free) {
      if (!run) run = { from: n.date, to: n.date, nights: 0 };
      run.nights += 1;
      run.to = addDays(n.date, 1);
    } else if (run) { runs.push(run); run = null; }
  }
  if (run) runs.push(run);
  runs.sort((a, b) => b.nights - a.nights || (a.from < b.from ? -1 : 1));

  return { status, totalNights: total, freeNights, nights: total <= DOT_LIMIT ? nights : null, freeRuns: status === 'partial' ? runs.slice(0, 3) : [] };
}

// The first free night from `after` on, as a stay of up to `stayNights` nights: { from, to, nights }, or null if none before horizonEnd.
export function nextFreeStay(busy, after, stayNights, horizonEnd) {
  const first = eachNight(after, horizonEnd).find((d) => !busy.has(d));
  if (!first) return null;
  let length = 0;
  for (let d = first; d < horizonEnd && !busy.has(d) && length < Math.max(1, stayNights); d = addDays(d, 1)) length += 1;
  return { from: first, to: addDays(first, length), nights: length };
}
