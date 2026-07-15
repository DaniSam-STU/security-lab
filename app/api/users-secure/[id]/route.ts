import { NextRequest, NextResponse } from 'next/server';
import { getDb, queryAll } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const loggedInUserId = req.headers.get('x-user-id') || '1';

  // Fresh DB each request — seed users are always present
  const db = await getDb();
  const rows = queryAll(db, 'SELECT id, username, email, role FROM users WHERE id = ?', [id]);

  if (!rows.length) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = rows[0];
  const loggedInRows = queryAll(db, 'SELECT role FROM users WHERE id = ?', [loggedInUserId]);
  const isAdmin = loggedInRows[0]?.role === 'admin';

  // SECURE: ownership check — you can only see your own profile (or admin sees all)
  if (!isAdmin && String(user.id) !== String(loggedInUserId)) {
    return NextResponse.json({
      error: 'Access denied. You can only view your own profile.',
      safe: true,
      blocked: true,
    }, { status: 403 });
  }

  // SECURE: password field never returned
  return NextResponse.json({
    user,
    safe: true,
    note: 'Password field omitted. Ownership verified.',
  });
}
