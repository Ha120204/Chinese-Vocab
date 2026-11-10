'use client';

const key = 'so-tay-chu-han:browser-id';

export function browserId() {
  try {
    const existing = localStorage.getItem(key);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export async function communityFetch(path: string, init: RequestInit = {}) {
  return fetch(path, {
    ...init,
    cache: 'no-store',
    headers: { ...init.headers, 'X-Community-Browser-ID': browserId(), ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
  });
}
