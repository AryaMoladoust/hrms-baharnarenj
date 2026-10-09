import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, requireOwnerApi } from '@/lib/owner/api';
import { recentJalaliMonths, todayTehran } from '@/lib/owner/dates';
import { monthlyTotals } from '@/lib/owner/finance';

// The ready-made monthly reports: the last N Jalali months (default 12), newest first.
export const GET = handle(async (request) => {
  await requireOwnerApi(request);
  const count = Math.min(24, Math.max(1, Number(new URL(request.url).searchParams.get('months')) || 12));
  const months = recentJalaliMonths(count, todayTehran());
  const from = months[months.length - 1].from;
  const to = months[0].to;
  const [reservations, expenses] = await Promise.all([repo.listFinanceReservations({ from, to }), repo.listExpenses({ from, to })]);
  return NextResponse.json({ months: monthlyTotals({ reservations, expenses, months }) });
});
