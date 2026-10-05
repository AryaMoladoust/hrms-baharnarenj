export const PLANS = ['standard', 'breakfast', 'full'];

export function discounted(price, discountPercent) {
  return Math.round(price * (1 - (discountPercent || 0) / 100));
}

// info = one item from getAvailability(). Discount applies to the room price only, not to the extra-guest fee.
export function calculateQuote({ info, plan, nights, guests }) {
  const base = info.prices[plan];
  const perNight = discounted(base, info.discountPercent);
  const extraGuests = Math.max(0, guests - info.guests.included);
  const roomTotal = perNight * nights;
  const extraTotal = extraGuests * info.guests.extraPrice * nights;
  return { base, perNight, extraGuests, roomTotal, extraTotal, total: roomTotal + extraTotal, discountPercent: info.discountPercent };
}
