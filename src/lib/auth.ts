import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'aura-fashion-secret-key';
const SESSION_DURATION = process.env.SESSION_DURATION || '7d';

export function getJwtSecret(): string {
  return JWT_SECRET;
}

function parseDuration(duration: string): number {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60;
    case 'h':
      return value * 60 * 60;
    case 'm':
      return value * 60;
    default:
      return parseInt(duration, 10) || 7 * 24 * 60 * 60;
  }
}

export function signJWT(payload: object): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseDuration(SESSION_DURATION);

  const base64Url = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const encodedHeader = base64Url(header);
  const encodedPayload = base64Url({ ...payload, exp });
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

export function verifyJWT(token: string): { username: string; role: string } | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) return null;

    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString()
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return { username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha256')
    .toString('hex');
  return `${salt}:${derivedKey}`;
}

export function comparePassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derivedKey = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha256')
    .toString('hex');
  return key === derivedKey;
}
