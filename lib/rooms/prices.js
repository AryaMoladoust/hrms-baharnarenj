// Real nightly prices, in Toman, as given by the guesthouse. Edit this file when prices change.
//
// Each room has three price tiers (the same three tiers the owner publishes):
//   stay          = stay only (no breakfast, no hygiene pack)
//   withBreakfast = stay + full breakfast
//   withPack      = stay + full breakfast + hygiene pack
// The booking form turns them into a base price plus two tick-box add-ons:
//   breakfast = withBreakfast - stay,   hygiene pack = withPack - withBreakfast  (the pack is always sold together with breakfast).
//
// Tables are keyed by Jalali month ('1405-07' = Mehr 1405). A check-in in a month that has no table yet falls back to DEFAULT_TABLE.
export const EXTRA_GUEST_PRICE = 1200000; // per extra guest, per night

const MEHR_1405 = {
  bahar: { stay: 4000000, withBreakfast: 4600000, withPack: 5450000 },
  paeez: { stay: 4000000, withBreakfast: 4600000, withPack: 5450000 },
  zemestan: { stay: 4000000, withBreakfast: 4600000, withPack: 5450000 },
  tabestan: { stay: 5250000, withBreakfast: 5850000, withPack: 6550000 }, // 3-bed room
  suite: { stay: 5580000, withBreakfast: 6600000, withPack: 8100000 },    // sleeps 4
};

export const PRICE_TABLES = {
  '1405-07': MEHR_1405,
};
export const DEFAULT_TABLE = '1405-07';

// Guests included in the nightly price, and the most the room can take.
// TODO confirm with the owner: "max" below is only an assumption (included + 1).
export const GUEST_RULES = {
  bahar: { included: 2, max: 3 },
  paeez: { included: 2, max: 3 },
  zemestan: { included: 2, max: 3 },
  tabestan: { included: 3, max: 4 },
  suite: { included: 4, max: 5 },
};

export function getRoomPricing(slug, jalaliYear, jalaliMonth) {
  const key = `${jalaliYear}-${String(jalaliMonth).padStart(2, '0')}`;
  const tier = (PRICE_TABLES[key] || PRICE_TABLES[DEFAULT_TABLE])[slug];
  return {
    stay: tier.stay,
    breakfast: tier.withBreakfast - tier.stay,
    hygiene: tier.withPack - tier.withBreakfast,
  };
}
