'use client';

export class ApiError extends Error {
  constructor(status, code, fields) {
    super(code);
    this.status = status;
    this.code = code;
    this.fields = fields || {};
  }
}

// fetch wrapper for /api/owner/*. A 401 (signed out, or password changed on another device) sends the owner to the login page.
export async function ownerFetch(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api/owner/${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/owner/login')) window.location.href = '/owner/login';
    throw new ApiError(401, 'unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || 'server', data.fields);
  return data;
}
