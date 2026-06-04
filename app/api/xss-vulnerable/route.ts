import { NextRequest, NextResponse } from 'next/server';
import getDb, { queryAll, queryRun } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { comment, author } = await req.json();
    if (!comment) return NextResponse.json({ error: 'No comment provided' }, { status: 400 });

    const db = await getDb();

    // VULNERABLE: raw input stored and reflected without sanitization
    queryRun(db, `INSERT INTO comments (author, body) VALUES (?, ?)`, [author || 'anonymous', comment]);

    const comments = queryAll(db, 'SELECT * FROM comments ORDER BY id DESC LIMIT 10');

    // VULNERABLE: directly embed raw HTML — no escaping
    const rendered = comments.map((c: any) => ({
      id: c.id,
      author: c.author,
      body: c.body,
      html: `<div class="comment-item"><strong>${c.author}</strong>: ${c.body}</div>`,
    }));

    return NextResponse.json({ comments: rendered, safe: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const db = await getDb();
  const comments = queryAll(db, 'SELECT * FROM comments ORDER BY id DESC LIMIT 10');
  const rendered = comments.map((c: any) => ({
    id: c.id,
    author: c.author,
    body: c.body,
    html: `<div class="comment-item"><strong>${c.author}</strong>: ${c.body}</div>`,
  }));
  return NextResponse.json({ comments: rendered, safe: false });
}
