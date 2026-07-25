import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { users, userRoles, familyMembers } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import type { Role } from '@/lib/drizzle/schema';

interface UserFamily {
  id: string;
  name: string;
  role: Role | null;
  memberStatus: string | null;
}

// GET /api/users/me - Get current user profile with families and roles
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all families with roles
    const familiesWithRoles = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
      with: {
        family: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get member status for each family
    const families: UserFamily[] = await Promise.all(
      familiesWithRoles.map(async (userRole) => {
        const member = await db.query.familyMembers.findFirst({
          where: and(
            eq(familyMembers.userId, userId),
            eq(familyMembers.familyId, userRole.familyId)
          ),
          columns: {
            status: true,
          },
        });

        return {
          id: userRole.family.id,
          name: userRole.family.name,
          role: userRole.role,
          memberStatus: member?.status ?? null,
        };
      })
    );

    // Check admin/super-admin status
    const isSuperAdmin = families.some((f) => f.role === 'super-admin');
    const isAdmin = families.some((f) => f.role === 'admin' || f.role === 'super-admin');

    return NextResponse.json({
      user: {
        ...user,
        isAdmin,
        isSuperAdmin,
      },
      families,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
