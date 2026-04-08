import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { events, eventHistory, notifications } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { canApproveEvent } from '@/lib/permissions';

// POST /api/events/[id]/reject - Rejeter un événement
export async function POST(
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

    // Récupérer l'événement
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Vérifier les permissions
    const canApprove = await canApproveEvent(userId, event.familyId);
    if (!canApprove) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mettre à jour le statut
    const [updatedEvent] = await db
      .update(events)
      .set({
        status: 'rejected',
        approvedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    // Historique
    await db.insert(eventHistory).values({
      eventId: id,
      userId,
      action: 'rejected',
      changes: { eventId: id, rejectedBy: userId },
    });

    // Notifier le créateur
    await db.insert(notifications).values({
      userId: event.createdBy,
      type: 'event_rejected',
      title: 'Événement rejeté',
      message: `Votre événement "${event.title}" a été rejeté`,
      data: { eventId: id, familyId: event.familyId },
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error rejecting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
