import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, publicOwner, requireOwnerApi } from '@/lib/owner/api';

export const GET = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  return NextResponse.json({ owner: publicOwner(owner), unread: await repo.countUnread(owner.username) });
});
