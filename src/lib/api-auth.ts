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
