import { rooms } from '@/lib/rooms';
import { partsOf } from '@/lib/calendar';
import { roomAvailability } from '@/lib/owner/overlap';
import { busyNights, describeStay, LOOKAHEAD_DAYS, nextFreeStay } from '@/lib/rooms/nights';
import { addDays } from '@/lib/dates';
import { EXTRA_GUEST_PRICE, getRoomPricing, GUEST_RULES } from '@/lib/rooms/prices';

/**
 * One info object per room for a stay: price, add-ons, guest rules and whether it is free.
 * Per-night details (nights, freeRuns, nextFree) come from lib/rooms/nights.js.
 * Used by the public availability API, by server-side quoting, and as the offline fallback in the browser.
 * discountPercent: the owner's global setting (positive = discount, negative = price increase).
 */
export function buildRoomInfos({ checkIn, checkOut, discountPercent = 0, reservations = [], nowMs = Date.now() }) {
  const { y, m } = partsOf(checkIn, 'jalali');
  const availability = roomAvailability(rooms.map((room) => room.slug), reservations, checkIn, checkOut, nowMs);
  const horizonEnd = addDays(checkOut, LOOKAHEAD_DAYS);
  return rooms.map((room) => {
    const pricing = getRoomPricing(room.slug, y, m);
    const busy = busyNights(reservations, room.slug, checkIn, horizonEnd, nowMs);
    const stay = describeStay(busy, checkIn, checkOut);
    return {
      slug: room.slug,
      status: stay.status, // 'free' (every night) | 'partial' (some nights) | 'booked' (no night)
      bookedUntil: availability[room.slug].bookedUntil,
      totalNights: stay.totalNights,
      freeNights: stay.freeNights,
      nights: stay.nights, // [{ date, free }] for stays up to 31 nights, otherwise null
      freeRuns: stay.freeRuns, // partial only: free stretches inside the stay, longest first, each { from, to, nights }
      nextFree: stay.status === 'booked' ? nextFreeStay(busy, checkIn, stay.totalNights, horizonEnd) : null,
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
