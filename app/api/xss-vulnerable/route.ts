import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD

// FIX: Stateless — no DB, no in-memory store.
// The route just reflects what it received, which is enough to demonstrate
// the vulnerability. Comment list lives in client React state.
=======
import getDb, { queryAll, queryRun } from '@/lib/db';
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a

export async function POST(req: NextRequest) {
  try {
    const { comment, author } = await req.json();
    if (!comment) return NextResponse.json({ error: 'No comment provided' }, { status: 400 });

<<<<<<< HEAD
    // VULNERABLE: raw input embedded directly into HTML — no escaping at all
    const html = `<div class="comment-item"><strong>${author || 'anonymous'}</strong>: ${comment}</div>`;

    return NextResponse.json({ html, safe: false });
=======
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
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
<<<<<<< HEAD
=======

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
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
