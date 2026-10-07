import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { familyMembers, userRoles, notifications } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { canManageFamily, getUserRole } from '@/lib/permissions';

const updateMemberSchema = z.object({
  status: z.enum(['pending', 'active', 'rejected']).optional(),
  role: z.enum(['admin', 'member']).optional(),
});

/**
 * Charge le membre ciblé après avoir vérifié que l'appelant peut gérer la famille.
 */
async function authorize(req: NextRequest, familyId: string, memberId: string) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const userId = session.user.id;

  const canManage = await canManageFamily(userId, familyId);
  if (!canManage) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  const member = await db.query.familyMembers.findFirst({
    where: and(
      eq(familyMembers.id, memberId),
      eq(familyMembers.familyId, familyId)
    ),
    with: {
      user: { columns: { id: true, name: true, email: true } },
    },
  });

  if (!member) {
    return { error: NextResponse.json({ error: 'Member not found' }, { status: 404 }) };
  }

  return { userId, member };
}

// PATCH /api/families/:id/members/:memberId - Valider, rejeter ou changer le rôle
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: familyId, memberId } = await params;
    const authResult = await authorize(req, familyId, memberId);
    if (authResult.error) return authResult.error;

    const { userId, member } = authResult;

    const body = await req.json();
    const validated = updateMemberSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { status, role } = validated.data;
    if (!status && !role) {
      return NextResponse.json(
        { error: 'Nothing to update' },
        { status: 400 }
      );
    }

    // Un admin ne peut pas rétrograder ou modifier un super-admin
    const targetRole = await getUserRole(member.userId, familyId);
    const actorRole = await getUserRole(userId, familyId);
    if (targetRole === 'super-admin' && actorRole !== 'super-admin') {
      return NextResponse.json(
        { error: 'Cannot modify a super-admin' },
        { status: 403 }
      );
    }

    if (status) {
      await db
        .update(familyMembers)
        .set({ status })
        .where(eq(familyMembers.id, memberId));
    }

    if (role) {
      const existingRole = await db.query.userRoles.findFirst({
        where: and(
          eq(userRoles.userId, member.userId),
          eq(userRoles.familyId, familyId)
        ),
      });

      if (existingRole) {
        await db
          .update(userRoles)
          .set({ role })
          .where(
            and(
              eq(userRoles.userId, member.userId),
              eq(userRoles.familyId, familyId)
            )
          );
      } else {
        await db.insert(userRoles).values({
          userId: member.userId,
          familyId,
          role,
        });
      }
    }

    // Prévenir le membre de la décision le concernant
    if (status === 'active' || status === 'rejected') {
      await db.insert(notifications).values({
        userId: member.userId,
        type: 'member_joined',
        title: status === 'active' ? 'Accès validé' : 'Demande refusée',
        message:
          status === 'active'
            ? 'Votre accès à la famille a été validé.'
            : 'Votre demande d\'accès à la famille a été refusée.',
        data: { familyId, memberId },
      });
    }

    const updated = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.id, memberId),
      with: {
        user: { columns: { id: true, name: true, email: true, image: true } },
      },
    });

    const newRole = await getUserRole(member.userId, familyId);

    return NextResponse.json({ member: { ...updated, role: newRole || 'member' } });
  } catch (error) {
    console.error('Error updating family member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/families/:id/members/:memberId - Retirer un membre de la famille
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: familyId, memberId } = await params;
    const authResult = await authorize(req, familyId, memberId);
    if (authResult.error) return authResult.error;

    const { userId, member } = authResult;

    if (member.userId === userId) {
      return NextResponse.json(
        { error: 'Use /leave to remove yourself from a family' },
        { status: 400 }
      );
    }

    const targetRole = await getUserRole(member.userId, familyId);
    const actorRole = await getUserRole(userId, familyId);
    if (targetRole === 'super-admin' && actorRole !== 'super-admin') {
      return NextResponse.json(
        { error: 'Cannot remove a super-admin' },
        { status: 403 }
      );
    }

    await db.delete(familyMembers).where(eq(familyMembers.id, memberId));
    await db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, member.userId),
          eq(userRoles.familyId, familyId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing family member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
