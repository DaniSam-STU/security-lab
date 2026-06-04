import { NextRequest, NextResponse } from 'next/server';

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

  return NextResponse.json({
    success: true,
    safe: false,
    message: `Transferred $${amount} from ${from} to ${to}. No CSRF protection!`,
    balances: { ...balances },
    transfers,
  });
}

export async function GET() {
  return NextResponse.json({ balances: { ...balances }, transfers });
}
