import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { eventHistory, events } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { isFamilyMember } from '@/lib/permissions';

// GET /api/events/[id]/history - Historique des modifications
export async function GET(
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

    // Vérifier l'accès à l'événement
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const hasAccess = await isFamilyMember(userId, event.familyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Récupérer l'historique
    const history = await db.query.eventHistory.findMany({
      where: eq(eventHistory.eventId, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: (history, { desc }) => [desc(history.createdAt)],
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching event history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
