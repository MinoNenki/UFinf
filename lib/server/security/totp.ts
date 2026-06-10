import { createHmac } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function decodeBase32(input: string) {
  const normalized = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = '';
  for (const ch of normalized) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx < 0) {
      throw new Error('Invalid base32 secret');
    }
    bits += idx.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number) {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac('sha1', secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24)
    | ((hmac[offset + 1] & 0xff) << 16)
    | ((hmac[offset + 2] & 0xff) << 8)
    | (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

function sanitizeOtp(input: string) {
  return input.replace(/\s+/g, '').trim();
}

export function verifyTotpCode(secretBase32: string, otp: string, skewSteps = 1) {
  const clean = sanitizeOtp(otp);
  if (!/^\d{6}$/.test(clean)) return false;

  const secret = decodeBase32(secretBase32);
  const step = 30;
  const nowCounter = Math.floor(Date.now() / 1000 / step);

  for (let i = -skewSteps; i <= skewSteps; i += 1) {
    if (hotp(secret, nowCounter + i) === clean) return true;
  }
  return false;
}

export function adminTotpSecret() {
  return (process.env.ADMIN_TOTP_SECRET || '').trim();
}
