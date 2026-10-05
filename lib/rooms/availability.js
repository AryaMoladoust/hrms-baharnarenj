import { rooms } from '@/lib/rooms';
import { addDays } from '@/lib/dates';

/**
 * SAMPLE DATA ONLY. Replace the body with:
 *   const res = await fetch(`/api/rooms/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
 *   return res.json();
 * Keep this shape for every room:
 * {
 *   slug, status: 'free' | 'booked', bookedUntil,
 *   prices: { standard, breakfast, full },   // per night, Toman, before discount
 *   discountPercent,                         // the owner's global discount (negative = price increase)
 *   guests: { included, max, extraPrice },   // extraPrice = per extra guest, per night
 * }
 */
const SAMPLE = {
  bahar: { standard: 1800000, breakfast: 2100000, full: 2600000 },
  tabestan: { standard: 1800000, breakfast: 2100000, full: 2600000 },
  paeez: { standard: 1800000, breakfast: 2100000, full: 2600000 },
  zemestan: { standard: 1800000, breakfast: 2100000, full: 2600000 },
  suite: { standard: 2600000, breakfast: 3000000, full: 3600000 },
};

export async function getAvailability({ checkIn }) {
  return rooms.map((room) => ({
    slug: room.slug,
    status: room.slug === 'paeez' ? 'booked' : 'free',
    bookedUntil: room.slug === 'paeez' ? addDays(checkIn, 3) : null,
    prices: SAMPLE[room.slug],
    discountPercent: 20,
    guests: { included: 2, max: room.slug === 'suite' ? 6 : 4, extraPrice: 300000 },
  }));
}
