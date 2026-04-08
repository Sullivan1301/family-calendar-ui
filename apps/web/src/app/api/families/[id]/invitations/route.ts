import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { families, invitations, notifications } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { canInviteToFamily } from '@/lib/permissions';

const createInvitationSchema = z.object({
  email: z.string().email(),
});

// POST /api/families/[id]/invitations - Créer une invitation email
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: familyId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier les permissions
    const canInvite = await canInviteToFamily(userId, familyId);
    if (!canInvite) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validated = createInvitationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid email', details: validated.error.errors },
        { status: 400 }
      );
    }

    const { email } = validated.data;

    // Vérifier si la famille existe
    const family = await db.query.families.findFirst({
      where: eq(families.id, familyId),
    });

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Créer l'invitation (expire dans 7 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invitation] = await db
      .insert(invitations)
      .values({
        familyId,
        email,
        invitedBy: userId,
        expiresAt,
      })
      .returning();

    // TODO: Envoyer un email avec le lien d'invitation
    // Le lien serait: `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${invitation.token}`

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
