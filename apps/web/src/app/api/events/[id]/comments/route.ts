import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { eventComments, events } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { isFamilyMember } from '@/lib/permissions';

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

// GET /api/events/[id]/comments - Liste des commentaires
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

    // Récupérer les commentaires
    const comments = await db.query.eventComments.findMany({
      where: eq(eventComments.eventId, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: (comments, { asc }) => [asc(comments.createdAt)],
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/comments - Ajouter un commentaire
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

    const body = await req.json();
    const validated = createCommentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.errors },
        { status: 400 }
      );
    }

    const { content } = validated.data;

    // Créer le commentaire
    const [comment] = await db
      .insert(eventComments)
      .values({
        eventId: id,
        userId,
        content,
      })
      .returning();

    // TODO: Notifier les autres membres (optionnel)

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
