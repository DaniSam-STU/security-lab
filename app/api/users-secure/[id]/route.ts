import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDb, queryAll } from '@/lib/db';
=======
import getDb, { queryAll } from '@/lib/db';
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const loggedInUserId = req.headers.get('x-user-id') || '1';

<<<<<<< HEAD
  // Fresh DB each request — seed users are always present
=======
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  const db = await getDb();
  const rows = queryAll(db, 'SELECT id, username, email, role FROM users WHERE id = ?', [id]);

  if (!rows.length) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = rows[0];
<<<<<<< HEAD
  const loggedInRows = queryAll(db, 'SELECT role FROM users WHERE id = ?', [loggedInUserId]);
  const isAdmin = loggedInRows[0]?.role === 'admin';

  // SECURE: ownership check — you can only see your own profile (or admin sees all)
=======
  const loggedInRows = queryAll(db, 'SELECT * FROM users WHERE id = ?', [loggedInUserId]);
  const isAdmin = loggedInRows[0]?.role === 'admin';

  // SECURE: ownership check
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  if (!isAdmin && String(user.id) !== String(loggedInUserId)) {
    return NextResponse.json({
      error: 'Access denied. You can only view your own profile.',
      safe: true,
      blocked: true,
    }, { status: 403 });
  }

<<<<<<< HEAD
  // SECURE: password field never returned
=======
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  return NextResponse.json({
    user,
    safe: true,
    note: 'Password field omitted. Ownership verified.',
  });
}
