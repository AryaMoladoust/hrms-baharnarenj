import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, HttpError, requireOwnerApi } from '@/lib/owner/api';
import { isIsoDate, jalaliMonthBounds, todayTehran } from '@/lib/owner/dates';
import { buildReport } from '@/lib/owner/finance';

// ?from=&to=&group=day|week|month  (default: this Jalali month, per day)
export const GET = handle(async (request) => {
  await requireOwnerApi(request);
  const params = new URL(request.url).searchParams;
  const month = jalaliMonthBounds(todayTehran());
  const from = isIsoDate(params.get('from')) ? params.get('from') : month.from;
  const to = isIsoDate(params.get('to')) ? params.get('to') : month.to;
  const group = ['day', 'week', 'month'].includes(params.get('group')) ? params.get('group') : 'day';

  const [reservations, expenses] = await Promise.all([repo.listFinanceReservations({ from, to }), repo.listExpenses({ from, to })]);
  try {
    return NextResponse.json(buildReport({ reservations, expenses, from, to, group }));
  } catch (error) {
    if (error instanceof RangeError) throw new HttpError(400, 'bad_range');
    throw error;
  }
});
