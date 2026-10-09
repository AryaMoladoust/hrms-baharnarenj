import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { addDays } from '@/lib/dates';
import { handle, readJson, requireOwnerApi } from '@/lib/owner/api';
import { todayTehran } from '@/lib/owner/dates';
import { setDiscount } from '@/lib/owner/services';
import { buildRoomInfos } from '@/lib/rooms/info';
import { discounted } from '@/lib/pricing';

// Today's nightly prices (stay only) before and after the owner's percentage, so the owner sees exactly what guests will see.
function priceTable(discountPercent) {
  const today = todayTehran();
  return buildRoomInfos({ checkIn: today, checkOut: addDays(today, 1), discountPercent }).map((info) => ({
    slug: info.slug, base: info.price, final: discounted(info.price, discountPercent),
    breakfast: info.addons.breakfast.price, hygiene: info.addons.hygiene.price,
  }));
}

export const GET = handle(async (request) => {
  await requireOwnerApi(request);
  const settings = await repo.getSettings();
  return NextResponse.json({ discountPercent: settings.discountPercent, history: settings.history || [], prices: priceTable(settings.discountPercent) });
});

// body: { percent }  positive = discount on all rooms, negative = price increase, 0 = normal prices
export const PUT = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  const { percent } = await readJson(request);
  const settings = await setDiscount(percent, owner.username);
  return NextResponse.json({ ok: true, discountPercent: settings.discountPercent, history: settings.history || [], prices: priceTable(settings.discountPercent) });
});
