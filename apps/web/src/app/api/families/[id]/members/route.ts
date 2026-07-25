import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { familyMembers, userRoles } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// GET /api/families/[id]/members - Liste des membres d'une famille
export async function GET(
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

    // Vérifier que l'utilisateur est membre de la famille
    const member = await db.query.familyMembers.findFirst({
      where: and(
        eq(familyMembers.familyId, familyId),
        eq(familyMembers.userId, userId),
        eq(familyMembers.status, 'active')
      ),
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Récupérer tous les membres
    const members = await db.query.familyMembers.findMany({
      where: eq(familyMembers.familyId, familyId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        invitedByUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (members, { desc }) => [desc(members.joinedAt)],
    });

    // Récupérer les rôles
    const roles = await db.query.userRoles.findMany({
      where: eq(userRoles.familyId, familyId),
    });

    // Combiner membres et rôles
    const membersWithRoles = members.map((member) => {
      const role = roles.find((r) => r.userId === member.userId);
      return {
        ...member,
        role: role?.role || 'member',
      };
    });

    return NextResponse.json({ members: membersWithRoles });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
