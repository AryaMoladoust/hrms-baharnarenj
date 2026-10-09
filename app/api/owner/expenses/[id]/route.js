import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, HttpError, readJson, requireOwnerApi } from '@/lib/owner/api';
import { todayTehran } from '@/lib/owner/dates';
import { validateExpense } from '@/lib/owner/validate';

export const PUT = handle(async (request, { params }) => {
  await requireOwnerApi(request);
  const { id } = await params;
  const clean = validateExpense(await readJson(request), { today: todayTehran() });
  const updated = await repo.updateExpense(id, clean);
  if (!updated) throw new HttpError(404, 'not_found');
  return NextResponse.json({ ok: true, expense: updated });
});

export const DELETE = handle(async (request, { params }) => {
  await requireOwnerApi(request);
  const { id } = await params;
  if (!(await repo.getExpense(id))) throw new HttpError(404, 'not_found');
  await repo.deleteExpense(id);
  return NextResponse.json({ ok: true });
});
