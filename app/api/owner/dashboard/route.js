import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { addDays } from '@/lib/dates';
import { handle, requireOwnerApi } from '@/lib/owner/api';
import { buildDashboard } from '@/lib/owner/dashboard';
import { jalaliMonthBounds, todayTehran } from '@/lib/owner/dates';
import { buildReport } from '@/lib/owner/finance';

export const GET = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  const nowMs = Date.now();
  const today = todayTehran(new Date(nowMs));
  const month = jalaliMonthBounds(today);

  const [around, financeRes, expenses, unread] = await Promise.all([
    repo.listReservations({ from: addDays(today, -1), to: addDays(today, 40), limit: 300 }),
    repo.listFinanceReservations({ from: month.from, to: month.to }),
    repo.listExpenses({ from: month.from, to: month.to }),
    repo.countUnread(owner.username),
  ]);

  const dashboard = buildDashboard({ reservations: around, today, nowMs, unread });
  const report = buildReport({ reservations: financeRes, expenses, from: month.from, to: month.to, group: 'day' });
  const recent = [...(await repo.listReservations({ limit: 60 }))]
    .filter((r) => r.kind === 'booking' && r.status !== 'cancelled')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
    .map((r) => ({ id: r.id, code: r.code, roomSlug: r.roomSlug, guestName: r.guest?.fullName || '', checkIn: r.checkIn, checkOut: r.checkOut, status: r.status, total: r.pricing?.total ?? 0, source: r.source, createdAt: r.createdAt }));

  return NextResponse.json({ ...dashboard, month: { from: month.from, to: month.to, y: month.y, m: month.m, ...report.totals, series: report.series }, recent });
});
