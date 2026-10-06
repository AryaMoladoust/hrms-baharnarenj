export const ADDONS = ['breakfast', 'hygiene'];

export function discounted(price, discountPercent) {
  return Math.round(price * (1 - (discountPercent || 0) / 100));
}

// How many times an add-on's price is charged, by its unit.
export function addonQuantity(unit, guests, nights) {
  if (unit === 'perPersonPerNight') return guests * nights;
  if (unit === 'perPerson') return guests;
  if (unit === 'perNight') return nights;
  return 1; // 'flat'
}

/**
 * info = one item from getAvailability(). Rules:
 *  - the owner's discount applies to the room price only (not to extra guests or add-ons)
 *  - guests above info.guests.included pay info.guests.extraPrice each, per night
 *  - every ticked add-on adds price x quantity (see addonQuantity)
 * Returns the total and a list of lines for the price summary.
 */
export function calculateQuote({ info, selected, nights, guests }) {
  const perNight = discounted(info.price, info.discountPercent);
  const lines = [{ type: 'room', nights, amount: perNight * nights }];

  const extraGuests = Math.max(0, guests - info.guests.included);
  if (extraGuests > 0) lines.push({ type: 'extraGuests', extraGuests, nights, amount: extraGuests * info.guests.extraPrice * nights });

  for (const key of ADDONS) {
    if (!selected[key]) continue;
    const { price, unit } = info.addons[key];
    const quantity = addonQuantity(unit, guests, nights);
    lines.push({ type: key, unit, guests, nights, amount: price * quantity });
  }

  return { perNight, lines, total: lines.reduce((sum, line) => sum + line.amount, 0), discountPercent: info.discountPercent };
}
