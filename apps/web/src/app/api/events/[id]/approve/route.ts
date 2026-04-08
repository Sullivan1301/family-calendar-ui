import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { events, eventHistory, notifications, userRoles } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { canApproveEvent, isFamilyMember } from '@/lib/permissions';

// POST /api/events/[id]/approve - Approuver un événement
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
        status: 'approved',
        approvedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    // Historique
    await db.insert(eventHistory).values({
      eventId: id,
      userId,
      action: 'approved',
      changes: { eventId: id, approvedBy: userId },
    });

    // Notifier le créateur
    await db.insert(notifications).values({
      userId: event.createdBy,
      type: 'event_approved',
      title: 'Événement approuvé',
      message: `Votre événement "${event.title}" a été approuvé`,
      data: { eventId: id, familyId: event.familyId },
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error approving event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
