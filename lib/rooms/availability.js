import { buildRoomInfos } from '@/lib/rooms/info';

/**
 * Prices, add-ons, guest rules and free/booked status of every room for a stay.
 * Asks the server (which knows the real reservations and the owner's discount).
 * If the server or database is not reachable (for example while developing without MongoDB) it falls back to the price list with every room free.
 *
 * Shape of every item: { slug, status: 'free' | 'booked', bookedUntil, price, discountPercent, guests: { included, max, extraPrice }, addons: { breakfast, hygiene } }
 */
export async function getAvailability({ checkIn, checkOut }) {
  try {
    const res = await fetch(`/api/rooms/availability?checkIn=${checkIn}&checkOut=${checkOut}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`availability ${res.status}`);
    return (await res.json()).rooms;
  } catch (error) {
    console.warn('Availability API not available, using the local price list (all rooms free).', error);
    return buildRoomInfos({ checkIn, checkOut, discountPercent: 0 });
  }
}

/**
 * The taken nights of one room from `from` for `days` days, for the room page calendar: { busy: ['YYYY-MM-DD', ...], ok }.
 * If the server or database is not reachable ok is false, and the calendar is hidden rather than showing every night free.
 */
export async function getRoomCalendar({ slug, from, days = 124 }) {
  try {
    const res = await fetch(`/api/rooms/calendar?slug=${encodeURIComponent(slug)}&from=${from}&days=${days}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`calendar ${res.status}`);
    return { busy: (await res.json()).busy, ok: true };
  } catch (error) {
    console.warn('Room calendar not available.', error);
    return { busy: [], ok: false };
  }
}
