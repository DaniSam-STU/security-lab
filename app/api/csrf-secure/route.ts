import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

<<<<<<< HEAD
// FIX: Stateless tokens — we use HMAC-style signed tokens instead of a
// server-side Set that evaporates on cold start.
// We sign a timestamp with a process-level secret so token validation
// doesn't require shared state across serverless instances.
//
// In a real app you'd use an env var for the secret; here we derive one
// from a fixed seed so the demo works without configuration.

const SECRET = 'seclab-demo-secret-change-in-prod';

function makeToken(): string {
  const ts    = Date.now().toString(36);
  const nonce = randomBytes(8).toString('hex');
  const raw   = `${ts}.${nonce}`;
  // Simple HMAC-lite: sha256(secret + raw) truncated — good enough for a demo
  const { createHmac } = require('crypto');
  const sig = createHmac('sha256', SECRET).update(raw).digest('hex').slice(0, 16);
  return `${raw}.${sig}`;
}

function verifyToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [ts, nonce, sig] = parts;
  const raw = `${ts}.${nonce}`;
  const { createHmac } = require('crypto');
  const expected = createHmac('sha256', SECRET).update(raw).digest('hex').slice(0, 16);
  if (sig !== expected) return false;
  // Expire after 10 minutes
  const issued = parseInt(ts, 36);
  return Date.now() - issued < 10 * 60 * 1000;
}
=======
const balances: Record<string, number> = { alice: 5000, bob: 2500, admin: 10000 };
const transfers: Array<{ from: string; to: string; amount: number; timestamp: string }> = [];
const validTokens = new Set<string>();
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get('action') === 'token') {
<<<<<<< HEAD
    return NextResponse.json({ csrfToken: makeToken() });
  }
  return NextResponse.json({ balances: { alice: 5000, bob: 2500, admin: 10000 } });
=======
    const token = randomBytes(32).toString('hex');
    validTokens.add(token);
    setTimeout(() => validTokens.delete(token), 5 * 60 * 1000);
    return NextResponse.json({ csrfToken: token });
  }
  return NextResponse.json({ balances: { ...balances }, transfers });
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
}

export async function POST(req: NextRequest) {
  const body = await req.json();
<<<<<<< HEAD
  const { from, to, amount, csrfToken, balances: incomingBalances } = body;

  // SECURE: validate signed CSRF token — no shared state required
  if (!verifyToken(csrfToken)) {
=======
  const { from, to, amount, csrfToken } = body;

  // SECURE: validate CSRF token
  if (!csrfToken || !validTokens.has(csrfToken)) {
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
    return NextResponse.json({
      error: 'Invalid or missing CSRF token. Request blocked.',
      safe: true,
      blocked: true,
    }, { status: 403 });
  }

<<<<<<< HEAD
  const balances: Record<string, number> = incomingBalances ?? { alice: 5000, bob: 2500, admin: 10000 };
  const fromBalance = balances[from] ?? 0;

  if (fromBalance < amount) {
    return NextResponse.json({ error: 'Insufficient balance', safe: true, balances });
  }

  balances[from] = fromBalance - amount;
  balances[to]   = (balances[to] ?? 0) + amount;
=======
  validTokens.delete(csrfToken);

  const fromBalance = balances[from] ?? 0;
  if (fromBalance < amount) {
    return NextResponse.json({ error: 'Insufficient balance', safe: true });
  }

  balances[from] = fromBalance - amount;
  balances[to] = (balances[to] ?? 0) + amount;
  transfers.push({ from, to, amount, timestamp: new Date().toISOString() });
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a

  return NextResponse.json({
    success: true,
    safe: true,
<<<<<<< HEAD
    message: `Transferred $${amount} — CSRF token validated ✓`,
    balances,
=======
    message: `Transferred $${amount} — CSRF token validated and consumed.`,
    balances: { ...balances },
    transfers,
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  });
}
