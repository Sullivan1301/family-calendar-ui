import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { events, eventResponses } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { isFamilyMember } from '@/lib/permissions';

const rsvpSchema = z.object({
  response: z.enum(['yes', 'maybe', 'no']),
  comment: z.string().max(500).optional().nullable(),
});

async function loadEventForMember(eventId: string, userId: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    return { error: NextResponse.json({ error: 'Event not found' }, { status: 404 }) };
  }

  const hasAccess = await isFamilyMember(userId, event.familyId);
  if (!hasAccess) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { event };
}

// GET /api/events/:id/rsvp - Réponses de présence de tous les membres
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
    const { error } = await loadEventForMember(id, userId);
    if (error) return error;

    const responses = await db.query.eventResponses.findMany({
      where: eq(eventResponses.eventId, id),
      with: {
        user: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    const mine = responses.find((r) => r.userId === userId) || null;

    return NextResponse.json({
      responses,
      myResponse: mine,
      counts: {
        yes: responses.filter((r) => r.response === 'yes').length,
        maybe: responses.filter((r) => r.response === 'maybe').length,
        no: responses.filter((r) => r.response === 'no').length,
      },
    });
  } catch (error) {
    console.error('Error fetching RSVP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/events/:id/rsvp - Enregistrer ou mettre à jour sa réponse
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
    const { error } = await loadEventForMember(id, userId);
    if (error) return error;

    const body = await req.json();
    const validated = rsvpSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid response', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { response, comment } = validated.data;

    const existing = await db.query.eventResponses.findFirst({
      where: and(
        eq(eventResponses.eventId, id),
        eq(eventResponses.userId, userId)
      ),
    });

    let saved;
    if (existing) {
      [saved] = await db
        .update(eventResponses)
        .set({ response, comment: comment ?? null, updatedAt: new Date() })
        .where(eq(eventResponses.id, existing.id))
        .returning();
    } else {
      [saved] = await db
        .insert(eventResponses)
        .values({ eventId: id, userId, response, comment: comment ?? null })
        .returning();
    }

    return NextResponse.json({ response: saved }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
