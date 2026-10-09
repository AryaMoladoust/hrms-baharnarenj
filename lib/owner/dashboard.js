import { rooms } from '@/lib/rooms';
import { addDays } from '@/lib/dates';
import { isActive, roomToday } from '@/lib/owner/overlap';

// What the dashboard shows, computed from the reservations around today. Pure: the route fetches the data.
export function buildDashboard({ reservations, today, nowMs, unread }) {
  const active = reservations.filter((r) => isActive(r, nowMs));
  const bookings = active.filter((r) => r.kind === 'booking');
  const roomStates = rooms.map((room) => roomToday(room.slug, active, today, nowMs));
  const brief = (r) => ({ id: r.id, code: r.code, roomSlug: r.roomSlug, guestName: r.guest?.fullName || '', mobile: r.guest?.mobile || '', checkIn: r.checkIn, checkOut: r.checkOut, guests: r.guests, status: r.status, total: r.pricing?.total ?? 0 });
  const weekEnd = addDays(today, 7);

  return {
    today,
    occupied: roomStates.filter((s) => s.state === 'occupied').length,
    totalRooms: rooms.length,
    rooms: roomStates.map((s) => ({ slug: s.slug, state: s.state, arriving: Boolean(s.arriving), departing: Boolean(s.departing), until: s.current?.checkOut || null, nextCheckIn: s.next?.checkIn || null, blocked: s.current?.kind === 'block' })),
    arrivals: bookings.filter((r) => r.checkIn === today).map(brief),
    departures: bookings.filter((r) => r.checkOut === today).map(brief),
    upcoming: bookings.filter((r) => r.checkIn > today && r.checkIn <= weekEnd).sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1)).map(brief),
    unread,
  };
}
