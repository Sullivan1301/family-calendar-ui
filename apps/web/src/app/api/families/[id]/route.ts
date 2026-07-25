import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { families, familyMembers, userRoles } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { canManageFamily, isFamilyMember } from '@/lib/permissions';

const updateFamilySchema = z.object({
  name: z.string().min(2).max(255).optional(),
});

// GET /api/families/:id - Détails d'une famille
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

    // Vérifier que l'utilisateur est membre de la famille
    const hasAccess = await isFamilyMember(userId, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Récupérer la famille avec ses membres
    const family = await db.query.families.findFirst({
      where: eq(families.id, id),
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Récupérer les membres
    const members = await db.query.familyMembers.findMany({
      where: and(
        eq(familyMembers.familyId, id),
        eq(familyMembers.status, 'active')
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      family: {
        ...family,
        members: members.map((m) => ({
          ...m.user,
          joinedAt: m.joinedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching family:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/families/:id - Modifier une famille
export async function PATCH(
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

    // Vérifier les permissions
    const canManage = await canManageFamily(userId, id);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validated = updateFamilySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validated.error.errors },
        { status: 400 }
      );
    }

    const { name } = validated.data;

    // Mise à jour
    const [updated] = await db
      .update(families)
      .set({
        ...(name && { name }),
        updatedAt: new Date(),
      })
      .where(eq(families.id, id))
      .returning();

    return NextResponse.json({ family: updated });
  } catch (error) {
    console.error('Error updating family:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/families/:id - Supprimer une famille
export async function DELETE(
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

    // Vérifier les permissions
    const canManage = await canManageFamily(userId, id);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Suppression (cascade gérée par la DB)
    await db.delete(families).where(eq(families.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
