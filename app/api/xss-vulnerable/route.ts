import { NextRequest, NextResponse } from 'next/server';

// FIX: Stateless — no DB, no in-memory store.
// The route just reflects what it received, which is enough to demonstrate
// the vulnerability. Comment list lives in client React state.

export async function POST(req: NextRequest) {
  try {
    const { comment, author } = await req.json();
    if (!comment) return NextResponse.json({ error: 'No comment provided' }, { status: 400 });

    // VULNERABLE: raw input embedded directly into HTML — no escaping at all
    const html = `<div class="comment-item"><strong>${author || 'anonymous'}</strong>: ${comment}</div>`;

    return NextResponse.json({ html, safe: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
