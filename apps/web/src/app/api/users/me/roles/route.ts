import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { userRoles } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// GET /api/users/me/roles - Récupérer les rôles de l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer tous les rôles de l'utilisateur
    const roles = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
    });

    // Extraire les rôles uniques
    const roleList = [...new Set(roles.map((r) => r.role))];

    return NextResponse.json({ roles: roleList });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
