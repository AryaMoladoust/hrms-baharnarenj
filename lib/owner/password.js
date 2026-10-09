import crypto from 'node:crypto';

// Passwords are never stored: only a salted scrypt hash ("scrypt$salt$hash").
const derive = (password, salt, length) =>
  new Promise((resolve, reject) => crypto.scrypt(password, salt, length, { N: 16384, r: 8, p: 1 }, (error, key) => (error ? reject(error) : resolve(key))));

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await derive(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, saltB64, keyB64] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64');
  const key = await derive(String(password), Buffer.from(saltB64, 'base64'), expected.length);
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}
