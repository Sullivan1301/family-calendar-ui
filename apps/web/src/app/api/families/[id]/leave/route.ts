import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { familyMembers, userRoles } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// POST /api/families/[id]/leave - Quitter une famille
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

    // Vérifier que l'utilisateur est membre
    const member = await db.query.familyMembers.findFirst({
      where: and(
        eq(familyMembers.familyId, familyId),
        eq(familyMembers.userId, userId)
      ),
    });

    if (!member) {
      return NextResponse.json({ error: 'Not a member of this family' }, { status: 400 });
    }

    // Vérifier si c'est le dernier admin
    const role = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, userId),
        eq(userRoles.familyId, familyId)
      ),
    });

    if (role?.role === 'admin') {
      // Compter les autres admins
      const otherAdmins = await db.query.userRoles.findMany({
        where: and(
          eq(userRoles.familyId, familyId),
          eq(userRoles.role, 'admin')
        ),
      });

      if (otherAdmins.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot leave: you are the last admin. Transfer admin rights first or delete the family.' },
          { status: 400 }
        );
      }
    }

    // Supprimer le membre et son rôle
    await db.delete(familyMembers).where(eq(familyMembers.id, member.id));
    await db.delete(userRoles).where(
      and(eq(userRoles.userId, userId), eq(userRoles.familyId, familyId))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving family:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
