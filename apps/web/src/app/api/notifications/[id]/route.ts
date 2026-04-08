import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { notifications } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// DELETE /api/notifications/[id] - Supprimer une notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, id),
        eq(notifications.userId, userId)
      ),
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Supprimer
    await db.delete(notifications).where(eq(notifications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
