import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, readJson, requireOwnerApi } from '@/lib/owner/api';

export const GET = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  const list = await repo.listNotifications({ limit: 50 });
  return NextResponse.json({
    unread: await repo.countUnread(owner.username),
    notifications: list.map((n) => ({ id: n.id, type: n.type, data: n.data, createdAt: n.createdAt, read: (n.readBy || []).includes(owner.username) })),
  });
});

// body: { ids: [...] } marks those as read; no ids = mark everything as read
export const POST = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  const body = await readJson(request).catch(() => ({}));
  await repo.markNotificationsRead({ ids: Array.isArray(body.ids) ? body.ids : null, username: owner.username });
  return NextResponse.json({ ok: true, unread: await repo.countUnread(owner.username) });
});
