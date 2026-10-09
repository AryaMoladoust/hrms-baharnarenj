import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, HttpError, readJson, requireOwnerApi } from '@/lib/owner/api';
import { pushEnabled } from '@/lib/push';

export const GET = handle(async (request) => {
  await requireOwnerApi(request);
  return NextResponse.json({ enabled: pushEnabled(), publicKey: pushEnabled() ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : null });
});

export const POST = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  const { subscription } = await readJson(request);
  if (!subscription?.endpoint || !subscription?.keys) throw new HttpError(400, 'bad_subscription');
  await repo.savePushSubscription({ username: owner.username, endpoint: subscription.endpoint, subscription });
  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (request) => {
  await requireOwnerApi(request);
  const { endpoint } = await readJson(request);
  if (endpoint) await repo.removePushSubscription(String(endpoint));
  return NextResponse.json({ ok: true });
});
