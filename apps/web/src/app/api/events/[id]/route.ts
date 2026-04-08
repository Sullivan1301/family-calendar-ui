import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { events, eventGuests, eventHistory, notifications, eventComments } from '@/lib/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { canEditEvent, canDeleteEvent, isFamilyMember, canManageFamily } from '@/lib/permissions';

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  type: z.enum(['mariage', 'baptême', 'anniversaire de décès', 'événement global', 'autre']).optional(),
});

// GET /api/events/:id - Détails d'un événement
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

    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        approvedByUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Vérifier l'accès
    const hasAccess = await isFamilyMember(userId, event.familyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Récupérer les invités
    const guests = await db.query.eventGuests.findMany({
      where: eq(eventGuests.eventId, id),
    });

    return NextResponse.json({
      event: {
        ...event,
        guests,
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/events/:id - Modifier un événement
export async function PATCH(
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

    // Vérifier les permissions
    const canEdit = await canEditEvent(userId, id);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validated = updateEventSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.errors },
        { status: 400 }
      );
    }

    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updates: Partial<typeof event> = {
      updatedAt: new Date(),
    };

    if (validated.data.title !== undefined) updates.title = validated.data.title;
    if (validated.data.description !== undefined) updates.description = validated.data.description;
    if (validated.data.startDate !== undefined) updates.startDate = new Date(validated.data.startDate);
    if (validated.data.endDate !== undefined) updates.endDate = validated.data.endDate ? new Date(validated.data.endDate) : null;
    if (validated.data.location !== undefined) updates.location = validated.data.location;
    if (validated.data.type !== undefined) updates.type = validated.data.type;

    // Historique avant modification
    await db.insert(eventHistory).values({
      eventId: id,
      userId,
      action: 'updated',
      changes: { before: event, after: updates },
    });

    const [updated] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();

    return NextResponse.json({ event: updated });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id - Supprimer un événement
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

    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Vérifier les permissions
    const canDelete = await canDeleteEvent(userId, id);
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Historique
    await db.insert(eventHistory).values({
      eventId: id,
      userId,
      action: 'deleted',
      changes: { event },
    });

    await db.delete(events).where(eq(events.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
