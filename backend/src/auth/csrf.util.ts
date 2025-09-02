import { createHmac, randomBytes } from 'crypto';

const CSRF_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

export function issueCsrfToken(secret: string, userId: string) {
  const nonce = randomBytes(16).toString('hex');
  const exp = Date.now() + CSRF_TTL_MS;
  const base = `${userId}.${nonce}.${exp}`;
  const sig = createHmac('sha256', secret).update(base).digest('hex');
  return `${base}.${sig}`; // userId.nonce.exp.sig
}

export function verifyCsrfToken(secret: string, token: string, userId: string) {
  try {
    const [uid, nonce, expStr, sig] = token.split('.');
    if (!uid || !nonce || !expStr || !sig) return false;
    if (uid !== userId) return false;
    const exp = parseInt(expStr, 10);
    if (isNaN(exp) || exp < Date.now()) return false;
    const base = `${uid}.${nonce}.${exp}`;
    const expected = createHmac('sha256', secret).update(base).digest('hex');
    return expected === sig;
  } catch {
    return false;
  }
}
