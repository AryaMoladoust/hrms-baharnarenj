import { rooms } from '@/lib/rooms';
import { addDays } from '@/lib/dates';
import { partsOf } from '@/lib/calendar';
import { EXTRA_GUEST_PRICE, getRoomPricing, GUEST_RULES } from '@/lib/rooms/prices';

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
 *     hygiene:   { price, unit, requires },  // requires: 'breakfast' means it can only be ticked together with breakfast
 *   },
 * }
 */
// Prices and guest rules are the real ones (lib/rooms/prices.js). Only `status` / `bookedUntil` and the discount are still sample data.
const SAMPLE_DISCOUNT_PERCENT = 0; // the owner's global discount; will come from the owner dashboard

export async function getAvailability({ checkIn }) {
  const { y, m } = partsOf(checkIn, 'jalali');
  return rooms.map((room) => {
    const pricing = getRoomPricing(room.slug, y, m);
    return {
      slug: room.slug,
      status: room.slug === 'paeez' ? 'booked' : 'free',
      bookedUntil: room.slug === 'paeez' ? addDays(checkIn, 3) : null,
      price: pricing.stay,
      discountPercent: SAMPLE_DISCOUNT_PERCENT,
      guests: { ...GUEST_RULES[room.slug], extraPrice: EXTRA_GUEST_PRICE },
      addons: {
        breakfast: { price: pricing.breakfast, unit: 'perNight' },
        hygiene: { price: pricing.hygiene, unit: 'perNight', requires: 'breakfast' }, // sold together with breakfast
      },
    };
  });
}
