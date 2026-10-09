// Which reservations occupy which rooms. Pure functions: the data comes from the database layer.
export const HOLD_MINUTES = 20; // an unpaid ("pending") online booking holds the room this long

export function overlaps(aIn, aOut, bIn, bOut) {
  return aIn < bOut && aOut > bIn; // the check-out day is free for the next check-in
}

// Does this reservation currently occupy its dates?
export function isActive(res, nowMs = Date.now()) {
  if (res.status === 'paid' || res.status === 'blocked') return true;
  if (res.status === 'pending') return res.source === 'manual' || nowMs - new Date(res.createdAt).getTime() < HOLD_MINUTES * 60000; // an owner's own unpaid booking holds the room until it is paid or cancelled
  return false; // cancelled
}

export function conflictsFor(reservations, slug, checkIn, checkOut, { excludeId, nowMs } = {}) {
  return reservations.filter((r) => r.roomSlug === slug && r.id !== excludeId && isActive(r, nowMs) && overlaps(r.checkIn, r.checkOut, checkIn, checkOut));
}

// For the public availability API: { slug: { status: 'free' | 'booked', bookedUntil } } for the requested stay.
export function roomAvailability(slugs, reservations, checkIn, checkOut, nowMs) {
  const out = {};
  for (const slug of slugs) {
    const hits = conflictsFor(reservations, slug, checkIn, checkOut, { nowMs });
    out[slug] = hits.length
      ? { status: 'booked', bookedUntil: hits.reduce((latest, r) => (r.checkOut > latest ? r.checkOut : latest), hits[0].checkOut) }
      : { status: 'free', bookedUntil: null };
  }
  return out;
}

// What is going on in one room today: occupied tonight, arriving, departing, or free, plus the next booking.
export function roomToday(slug, reservations, today, nowMs) {
  const mine = reservations.filter((r) => r.roomSlug === slug && isActive(r, nowMs));
  const current = mine.find((r) => r.checkIn <= today && today < r.checkOut) || null;
  const arriving = mine.find((r) => r.checkIn === today) || null;
  const departing = mine.find((r) => r.checkOut === today) || null;
  const next = mine.filter((r) => r.checkIn > today).sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1))[0] || null;
  return { slug, state: current ? 'occupied' : 'free', current, arriving, departing, next };
}

// Grid for the rooms calendar: one row per room, one cell per night (the night starting on that date).
export function buildTimeline(slugs, reservations, days, nowMs) {
  return slugs.map((slug) => {
    const mine = reservations.filter((r) => r.roomSlug === slug && isActive(r, nowMs));
    return {
      slug,
      cells: days.map((iso) => {
        const res = mine.find((r) => r.checkIn <= iso && iso < r.checkOut) || null;
        return { iso, res: res ? { id: res.id, code: res.code, kind: res.kind, status: res.status, guestName: res.guest?.fullName || '', first: res.checkIn === iso, last: iso === lastNight(res.checkOut) } : null };
      }),
    };
  });
}

function lastNight(checkOut) {
  const d = new Date(`${checkOut}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
