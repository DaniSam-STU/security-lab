import { NextRequest, NextResponse } from 'next/server';

// FIX: Stateless — no DB, no in-memory store.
// The route escapes the input and returns the safe HTML.
// Comment list lives in client React state.

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

export async function POST(req: NextRequest) {
  try {
    const { comment, author } = await req.json();
    if (!comment) return NextResponse.json({ error: 'No comment provided' }, { status: 400 });

    const safeComment = escapeHtml(comment);
    const safeAuthor  = escapeHtml(author || 'anonymous');

    // SECURE: escaped values are plain text — never parsed as HTML
    const html = `<div class="comment-item"><strong>${safeAuthor}</strong>: ${safeComment}</div>`;

    return NextResponse.json({ html, sanitized: safeComment, safe: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
