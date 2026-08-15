import { NextRequest } from 'next/server';
import { verifyJWT } from './auth';

export function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim();
}

export function getAuthUser(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) return null;
  return verifyJWT(token);
}

let logoutHandler: (() => void) | null = null;

export function setLogoutHandler(handler: () => void) {
  logoutHandler = handler;
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const res = await fetch(input, {
    ...init,
    headers: {
      ...init.headers,
    },
  });

  if (res.status === 401) {
    if (logoutHandler) {
      logoutHandler();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return res;
}
