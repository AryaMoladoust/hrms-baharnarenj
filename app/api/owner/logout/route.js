import { NextResponse } from 'next/server';
import { handle } from '@/lib/owner/api';
import { clearSessionCookie } from '@/lib/owner/session';

export const POST = handle(async () => {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
});
