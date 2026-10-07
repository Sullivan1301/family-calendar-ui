import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { invitations } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// GET /api/invitations/:token - Aperçu d'une invitation avant acceptation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, token),
      with: {
        family: { columns: { id: true, name: true } },
        invitedByUser: { columns: { id: true, name: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 });
    }

    const expired = new Date() > invitation.expiresAt;
    // L'invitation est nominative : seul le destinataire peut l'accepter.
    const emailMatches = session.user.email === invitation.email;

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        familyName: invitation.family?.name ?? null,
        invitedByName: invitation.invitedByUser?.name ?? null,
      },
      canAccept: invitation.status === 'pending' && !expired && emailMatches,
      expired,
      emailMatches,
      sessionEmail: session.user.email,
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
