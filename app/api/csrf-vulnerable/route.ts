import { NextRequest, NextResponse } from 'next/server';

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

  return NextResponse.json({
    success: true,
    safe: false,
    message: `Transferred $${amount} from ${from} to ${to}. No CSRF protection!`,
    balances,
  });
}

export async function GET() {
  // Return default balances for initial page load
  return NextResponse.json({ balances: { alice: 5000, bob: 2500, admin: 10000 } });
}
