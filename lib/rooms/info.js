import { rooms } from '@/lib/rooms';
import { partsOf } from '@/lib/calendar';
import { roomAvailability } from '@/lib/owner/overlap';
import { EXTRA_GUEST_PRICE, getRoomPricing, GUEST_RULES } from '@/lib/rooms/prices';

/**
 * One info object per room for a stay: price, add-ons, guest rules and whether it is free.
 * Used by the public availability API, by server-side quoting, and as the offline fallback in the browser.
 * discountPercent: the owner's global setting (positive = discount, negative = price increase).
 */
export function buildRoomInfos({ checkIn, checkOut, discountPercent = 0, reservations = [], nowMs = Date.now() }) {
  const { y, m } = partsOf(checkIn, 'jalali');
  const availability = roomAvailability(rooms.map((room) => room.slug), reservations, checkIn, checkOut, nowMs);
  return rooms.map((room) => {
    const pricing = getRoomPricing(room.slug, y, m);
    return {
      slug: room.slug,
      status: availability[room.slug].status,
      bookedUntil: availability[room.slug].bookedUntil,
      price: pricing.stay,
      discountPercent,
      guests: { ...GUEST_RULES[room.slug], extraPrice: EXTRA_GUEST_PRICE },
      addons: {
        breakfast: { price: pricing.breakfast, unit: 'perNight' },
        hygiene: { price: pricing.hygiene, unit: 'perNight', requires: 'breakfast' }, // sold together with breakfast
      },
    };
  });
}
