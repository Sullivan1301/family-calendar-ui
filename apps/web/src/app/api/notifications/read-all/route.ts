import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { notifications } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// PATCH /api/notifications/read-all - Marquer toutes les notifications comme lues
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Mettre à jour toutes les notifications non lues
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
