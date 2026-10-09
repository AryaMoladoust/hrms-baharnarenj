import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, readJson, requireOwnerApi } from '@/lib/owner/api';
import { hashPassword, verifyPassword } from '@/lib/owner/password';
import { setSessionCookie } from '@/lib/owner/session';
import { validateNewPassword, ValidationError } from '@/lib/owner/validate';

// Each owner changes their own password. Changing it also signs out every other device (sessionVersion + 1).
export const POST = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  const { current, next } = await readJson(request);
  if (!(await verifyPassword(String(current || ''), owner.passwordHash))) throw new ValidationError({ current: 'errPassWrong' });
  const value = validateNewPassword(next, current);
  const updated = await repo.updateOwner(owner.username, { passwordHash: await hashPassword(value), mustChangePassword: false }, { sessionVersion: 1 });
  await setSessionCookie(updated); // keep this device signed in
  return NextResponse.json({ ok: true });
});
