import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { families, familyMembers } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { generateInvitationCode } from '@/lib/permissions';

const createFamilySchema = z.object({
  name: z.string().min(2).max(255),
});

// GET /api/families - Liste les familles de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les familles où l'utilisateur est membre actif
    const memberFamilies = await db.query.familyMembers.findMany({
      where: and(
        eq(familyMembers.userId, userId),
        eq(familyMembers.status, 'active')
      ),
      with: {
        family: {
          with: {
            createdByUser: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Formatter la réponse
    const formattedFamilies = memberFamilies.map((member) => ({
      ...member.family,
      memberStatus: member.status,
      joinedAt: member.joinedAt,
    }));

    return NextResponse.json({ families: formattedFamilies });
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/families - Créer une nouvelle famille
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = createFamilySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.errors },
        { status: 400 }
      );
    }

    const { name } = validated.data;
    const userId = session.user.id;

    // Créer la famille avec un code d'invitation
    const [family] = await db
      .insert(families)
      .values({
        name,
        createdBy: userId,
        invitationCode: generateInvitationCode(),
      })
      .returning();

    // Ajouter le créateur comme membre admin
    await db.insert(familyMembers).values({
      familyId: family.id,
      userId,
      status: 'active',
    });

    // Définir le rôle admin
    await db.insert(userRoles).values({
      userId,
      familyId: family.id,
      role: 'admin',
    });

    return NextResponse.json({ family }, { status: 201 });
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
