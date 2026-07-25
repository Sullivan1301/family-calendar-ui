import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { invitations } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// POST /api/invitations/[token]/decline - Refuser une invitation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trouver l'invitation
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, token),
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    // Vérifier le statut
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation already used or revoked' },
        { status: 400 }
      );
    }

    // Marquer comme refusée
    await db
      .update(invitations)
      .set({ status: 'revoked' })
      .where(eq(invitations.id, invitation.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
