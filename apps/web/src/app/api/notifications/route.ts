import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { notifications } from '@/lib/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// GET /api/notifications - Liste des notifications de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get('unread') === 'true';

    let query = db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: desc(notifications.createdAt),
    });

    const results = await query;

    // Filtrer si demandé
    const filtered = unreadOnly ? results.filter((n) => !n.read) : results;

    return NextResponse.json({
      notifications: filtered,
      unreadCount: results.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Marquer tout comme lu
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
