import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { invitations, familyMembers, userRoles, notifications } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// POST /api/invitations/[token]/accept - Accepter une invitation
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

    const userId = session.user.id;

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

    // Vérifier l'expiration
    if (new Date() > invitation.expiresAt) {
      await db
        .update(invitations)
        .set({ status: 'expired' })
        .where(eq(invitations.id, invitation.id));
      
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Vérifier que l'email correspond
    if (session.user.email !== invitation.email) {
      return NextResponse.json(
        { error: 'Email does not match invitation' },
        { status: 403 }
      );
    }

    // Ajouter comme membre
    const existingMember = await db.query.familyMembers.findFirst({
      where: and(
        eq(familyMembers.familyId, invitation.familyId),
        eq(familyMembers.userId, userId)
      ),
    });

    if (existingMember) {
      // Réactiver si déjà membre
      await db
        .update(familyMembers)
        .set({ status: 'active' })
        .where(eq(familyMembers.id, existingMember.id));
    } else {
      await db.insert(familyMembers).values({
        familyId: invitation.familyId,
        userId,
        invitedBy: invitation.invitedBy,
        status: 'active',
      });
    }

    // Ajouter le rôle member
    await db.insert(userRoles).values({
      userId,
      familyId: invitation.familyId,
      role: 'member',
    });

    // Marquer l'invitation comme acceptée
    await db
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, invitation.id));

    // Notifier l'admin qui a invité
    await db.insert(notifications).values({
      userId: invitation.invitedBy,
      type: 'member_joined',
      title: 'Nouveau membre',
      message: `${session.user.name || session.user.email} a rejoint votre famille`,
      data: { familyId: invitation.familyId, userId },
    });

    return NextResponse.json({ success: true, familyId: invitation.familyId });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
