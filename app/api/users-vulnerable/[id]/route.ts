import { NextRequest, NextResponse } from 'next/server';
import { getDb, queryAll } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fresh DB each request — seed users are always present
  const db = await getDb();
  const rows = queryAll(db, 'SELECT id, username, email, role, password FROM users WHERE id = ?', [id]);

  if (!rows.length) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // VULNERABLE: no auth check, returns password field
  return NextResponse.json({
    user: rows[0],
    safe: false,
    warning: 'No authentication or authorization check performed!',
  });
}
