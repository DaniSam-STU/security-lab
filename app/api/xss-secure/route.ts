import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD

// FIX: Stateless — no DB, no in-memory store.
// The route escapes the input and returns the safe HTML.
// Comment list lives in client React state.

=======
import getDb, { queryAll, queryRun } from '@/lib/db';

// Pure JS HTML escaping — no external library needed, this IS the correct fix
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
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

<<<<<<< HEAD
    // SECURE: escaped values are plain text — never parsed as HTML
    const html = `<div class="comment-item"><strong>${safeAuthor}</strong>: ${safeComment}</div>`;

    return NextResponse.json({ html, sanitized: safeComment, safe: true });
=======
    const db = await getDb();
    queryRun(db, `INSERT INTO comments (author, body) VALUES (?, ?)`, [safeAuthor, safeComment]);

    const comments = queryAll(db, 'SELECT * FROM comments ORDER BY id DESC LIMIT 10');
    const rendered = comments.map((c: any) => ({
      id: c.id,
      author: escapeHtml(String(c.author)),
      body:   escapeHtml(String(c.body)),
      html:   `<div class="comment-item"><strong>${escapeHtml(String(c.author))}</strong>: ${escapeHtml(String(c.body))}</div>`,
    }));

    return NextResponse.json({ comments: rendered, safe: true, sanitized: safeComment });
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
<<<<<<< HEAD
=======

export async function GET() {
  function escapeHtml(s: string) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  const db = await getDb();
  const comments = queryAll(db, 'SELECT * FROM comments ORDER BY id DESC LIMIT 10');
  const rendered = comments.map((c: any) => ({
    id: c.id,
    author: escapeHtml(String(c.author)),
    body:   escapeHtml(String(c.body)),
    html:   `<div class="comment-item"><strong>${escapeHtml(String(c.author))}</strong>: ${escapeHtml(String(c.body))}</div>`,
  }));
  return NextResponse.json({ comments: rendered, safe: true });
}
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
