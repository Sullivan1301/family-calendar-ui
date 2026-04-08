import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { families, familyMembers, userRoles, invitations } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';

const joinCodeSchema = z.object({
  code: z.string().length(8),
});

// POST /api/families/join-code - Rejoindre une famille par code
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = joinCodeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    const { code } = validated.data;
    const userId = session.user.id;

    // Trouver la famille par code
    const family = await db.query.families.findFirst({
      where: eq(families.invitationCode, code),
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 404 }
      );
    }

    // Vérifier si déjà membre
    const existingMember = await db.query.familyMembers.findFirst({
      where: and(
        eq(familyMembers.familyId, family.id),
        eq(familyMembers.userId, userId)
      ),
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        return NextResponse.json(
          { error: 'Already a member of this family' },
          { status: 400 }
        );
      }
      // Réactiver si status pending/rejected
      await db
        .update(familyMembers)
        .set({ status: 'active' })
        .where(eq(familyMembers.id, existingMember.id));
    } else {
      // Ajouter comme nouveau membre
      await db.insert(familyMembers).values({
        familyId: family.id,
        userId,
        status: 'active',
      });
    }

    // Ajouter le rôle member
    await db.insert(userRoles).values({
      userId,
      familyId: family.id,
      role: 'member',
    });

    return NextResponse.json({
      success: true,
      family,
    });
  } catch (error) {
    console.error('Error joining family:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
