import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { events, eventGuests, eventHistory, notifications } from '@/lib/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { isFamilyMember, getUserRole } from '@/lib/permissions';
import type { EventType, EventStatus } from '@/lib/drizzle/schema';

const createEventSchema = z.object({
  familyId: z.string().uuid(),
  title: z.string().min(1).max(255),
  type: z.enum(['mariage', 'baptême', 'anniversaire de décès', 'événement global', 'autre']),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  guests: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional(),
  })).optional(),
});

const querySchema = z.object({
  familyId: z.string().uuid(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
});

// GET /api/events - Liste des événements
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const validated = querySchema.safeParse({
      familyId: searchParams.get('familyId'),
      start: searchParams.get('start'),
      end: searchParams.get('end'),
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid query params', details: validated.error.errors },
        { status: 400 }
      );
    }

    const { familyId, start, end } = validated.data;

    // Vérifier l'accès à la famille
    const hasAccess = await isFamilyMember(userId, familyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Construire la requête
    let query = db.query.events.findMany({
      where: eq(events.familyId, familyId),
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
      orderBy: desc(events.startDate),
    });

    const events = await query;

    // Filtrer par date si spécifié
    let filtered = events;
    if (start) {
      filtered = filtered.filter(e => new Date(e.startDate) >= new Date(start));
    }
    if (end) {
      filtered = filtered.filter(e => new Date(e.startDate) <= new Date(end));
    }

    return NextResponse.json({ events: filtered });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/events - Créer un événement
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = createEventSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.errors },
        { status: 400 }
      );
    }

    const { familyId, title, type, description, startDate, endDate, location, guests } = validated.data;
    const userId = session.user.id;

    // Vérifier l'accès à la famille
    const hasAccess = await isFamilyMember(userId, familyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Déterminer le statut selon le rôle
    const role = await getUserRole(userId, familyId);
    const status: EventStatus = (role === 'admin' || role === 'super-admin') ? 'approved' : 'pending';

    // Créer l'événement
    const [event] = await db
      .insert(events)
      .values({
        familyId,
        title,
        type: type as EventType,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        createdBy: userId,
        status,
        approvedBy: status === 'approved' ? userId : null,
      })
      .returning();

    // Ajouter les invités
    if (guests && guests.length > 0) {
      await db.insert(eventGuests).values(
        guests.map(g => ({
          eventId: event.id,
          name: g.name,
          email: g.email || null,
        }))
      );
    }

    // Historique
    await db.insert(eventHistory).values({
      eventId: event.id,
      userId,
      action: 'created',
      changes: { event },
    });

    // Si pending, notifier les admins
    if (status === 'pending') {
      // Récupérer les admins de la famille
      const { userRoles } = await import('@/lib/drizzle/schema');
      const admins = await db.query.userRoles.findMany({
        where: and(
          eq(userRoles.familyId, familyId),
          eq(userRoles.role, 'admin')
        ),
      });

      // Créer notifications
      for (const admin of admins) {
        if (admin.userId !== userId) {
          await db.insert(notifications).values({
            userId: admin.userId,
            type: 'event_invitation',
            title: 'Nouvel événement en attente',
            message: `${session.user.name || session.user.email} a créé "${title}"`,
            data: { eventId: event.id, familyId },
          });
        }
      }
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
