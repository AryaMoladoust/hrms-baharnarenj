import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { getSession } from '@/lib/owner/session';
import { ValidationError } from '@/lib/owner/validate';

export class HttpError extends Error {
  constructor(status, code, extra) {
    super(code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

// Wraps a route handler: turns HttpError / ValidationError into clean JSON errors and hides unexpected ones.
export function handle(fn) {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof HttpError) return NextResponse.json({ error: error.code, ...(error.extra || {}) }, { status: error.status });
      if (error instanceof ValidationError) return NextResponse.json({ error: 'validation', fields: error.errors }, { status: 400 });
      console.error(error);
      return NextResponse.json({ error: 'server' }, { status: 500 });
    }
  };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'bad_json');
  }
}

export const publicOwner = (owner) => ({ username: owner.username, displayName: owner.displayName || owner.username, mustChangePassword: Boolean(owner.mustChangePassword) });

// Every owner API starts with this: valid signed cookie + the owner still exists + the password was not changed since the cookie was issued.
export async function requireOwnerApi(request) {
  const session = await getSession();
  if (!session) throw new HttpError(401, 'unauthorized');
  const owner = await repo.findOwnerByUsername(session.u);
  if (!owner || owner.sessionVersion !== session.sv) throw new HttpError(401, 'unauthorized');

  // Basic CSRF guard for anything that changes data: the request must come from this same site.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host && new URL(origin).host !== host) throw new HttpError(403, 'bad_origin');
  }
  return owner;
}
