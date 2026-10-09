import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, readJson, requireOwnerApi } from '@/lib/owner/api';
import { isIsoDate, jalaliMonthBounds, todayTehran } from '@/lib/owner/dates';
import { validateExpense } from '@/lib/owner/validate';

// ?from=&to= (default: the current Jalali month)
export const GET = handle(async (request) => {
  await requireOwnerApi(request);
  const params = new URL(request.url).searchParams;
  const month = jalaliMonthBounds(todayTehran());
  const from = isIsoDate(params.get('from')) ? params.get('from') : month.from;
  const to = isIsoDate(params.get('to')) ? params.get('to') : month.to;
  const expenses = await repo.listExpenses({ from, to });
  return NextResponse.json({ from, to, total: expenses.reduce((sum, e) => sum + e.amount, 0), expenses });
});

export const POST = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  const clean = validateExpense(await readJson(request), { today: todayTehran() });
  return NextResponse.json({ ok: true, expense: await repo.createExpense({ ...clean, createdBy: owner.username }) }, { status: 201 });
});
