import crypto from 'crypto';

/**
 * Modern memory-hard password hashing using Node.js scrypt.
 * Stores format: scrypt:<salt>:<derivedKeyHex>
 * Resistant to GPU / ASIC brute-forcing.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Timing-safe password verification against stored scrypt hash.
 */
export async function verifyPassword(password: string, storedHash?: string | null): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith('scrypt:')) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 3) return false;
  const [, salt, originalKeyHex] = parts;

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      const originalKeyBuffer = Buffer.from(originalKeyHex, 'hex');
      if (originalKeyBuffer.length !== derivedKey.length) {
        return resolve(false);
      }
      resolve(crypto.timingSafeEqual(originalKeyBuffer, derivedKey));
    });
  });
}
