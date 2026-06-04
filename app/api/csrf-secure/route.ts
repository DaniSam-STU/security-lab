import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const balances: Record<string, number> = { alice: 5000, bob: 2500, admin: 10000 };
const transfers: Array<{ from: string; to: string; amount: number; timestamp: string }> = [];
const validTokens = new Set<string>();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get('action') === 'token') {
    const token = randomBytes(32).toString('hex');
    validTokens.add(token);
    setTimeout(() => validTokens.delete(token), 5 * 60 * 1000);
    return NextResponse.json({ csrfToken: token });
  }
  return NextResponse.json({ balances: { ...balances }, transfers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { from, to, amount, csrfToken } = body;

  // SECURE: validate CSRF token
  if (!csrfToken || !validTokens.has(csrfToken)) {
    return NextResponse.json({
      error: 'Invalid or missing CSRF token. Request blocked.',
      safe: true,
      blocked: true,
    }, { status: 403 });
  }

  validTokens.delete(csrfToken);

  const fromBalance = balances[from] ?? 0;
  if (fromBalance < amount) {
    return NextResponse.json({ error: 'Insufficient balance', safe: true });
  }

  balances[from] = fromBalance - amount;
  balances[to] = (balances[to] ?? 0) + amount;
  transfers.push({ from, to, amount, timestamp: new Date().toISOString() });

  return NextResponse.json({
    success: true,
    safe: true,
    message: `Transferred $${amount} — CSRF token validated and consumed.`,
    balances: { ...balances },
    transfers,
  });
}
