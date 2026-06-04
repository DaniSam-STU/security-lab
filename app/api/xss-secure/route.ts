import { NextRequest, NextResponse } from 'next/server';
import getDb, { queryAll, queryRun } from '@/lib/db';

// Pure JS HTML escaping — no external library needed, this IS the correct fix
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
