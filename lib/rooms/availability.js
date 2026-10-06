import { rooms } from '@/lib/rooms';
import { addDays } from '@/lib/dates';

/**
 * SAMPLE DATA ONLY. Replace the body with:
 *   const res = await fetch(`/api/rooms/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
 *   return res.json();
 * Keep this shape for every room:
 * {
 *   slug, status: 'free' | 'booked', bookedUntil,
 *   price,                                   // per night, Toman, before discount
 *   discountPercent,                         // the owner's global discount (negative = price increase)
 *   guests: { included, max, extraPrice },   // extraPrice = per extra guest, per night
 *   addons: {
 *     breakfast: { price, unit },            // unit: 'perPersonPerNight' | 'perPerson' | 'perNight' | 'flat'
 *     hygiene:   { price, unit },
 *   },
 * }
 */
const SAMPLE_PRICE = { bahar: 1800000, tabestan: 1800000, paeez: 1800000, zemestan: 1800000, suite: 2600000 };

export async function getAvailability({ checkIn }) {
  return rooms.map((room) => ({
    slug: room.slug,
    status: room.slug === 'paeez' ? 'booked' : 'free',
    bookedUntil: room.slug === 'paeez' ? addDays(checkIn, 3) : null,
    price: SAMPLE_PRICE[room.slug],
    discountPercent: 20,
    guests: { included: 2, max: room.slug === 'suite' ? 6 : 4, extraPrice: 300000 },
    addons: {
      breakfast: { price: 150000, unit: 'perPersonPerNight' },
      hygiene: { price: 50000, unit: 'perPerson' },
    },
  }));
}
