import { NextRequest, NextResponse } from 'next/server';

<<<<<<< HEAD
// FIX: Stateless — balances are passed in by the client and returned updated.
// This means cold starts never reset the demo mid-session.
// The vulnerability being demonstrated (no CSRF token) is unchanged.

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { from, to, amount, balances: incomingBalances } = body;

  // Fallback to defaults if client sends nothing (first load)
  const balances: Record<string, number> = incomingBalances ?? { alice: 5000, bob: 2500, admin: 10000 };

  // VULNERABLE: no CSRF token check, no Origin check — any site can POST this
  const fromBalance = balances[from] ?? 0;
  if (fromBalance < amount) {
    return NextResponse.json({ error: 'Insufficient balance', safe: false, balances });
  }

  balances[from] = fromBalance - amount;
  balances[to]   = (balances[to] ?? 0) + amount;
=======
// In-memory balances (resets on cold start — fine for demo)
const balances: Record<string, number> = { alice: 5000, bob: 2500, admin: 10000 };
const transfers: Array<{ from: string; to: string; amount: number; timestamp: string }> = [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { from, to, amount } = body;

  // VULNERABLE: no CSRF token check, no origin check
  const fromBalance = balances[from] ?? 0;
  if (fromBalance < amount) {
    return NextResponse.json({ error: 'Insufficient balance', safe: false });
  }

  balances[from] = fromBalance - amount;
  balances[to] = (balances[to] ?? 0) + amount;
  transfers.push({ from, to, amount, timestamp: new Date().toISOString() });
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a

  return NextResponse.json({
    success: true,
    safe: false,
    message: `Transferred $${amount} from ${from} to ${to}. No CSRF protection!`,
<<<<<<< HEAD
    balances,
=======
    balances: { ...balances },
    transfers,
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  });
}

export async function GET() {
<<<<<<< HEAD
  // Return default balances for initial page load
  return NextResponse.json({ balances: { alice: 5000, bob: 2500, admin: 10000 } });
=======
  return NextResponse.json({ balances: { ...balances }, transfers });
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
}
