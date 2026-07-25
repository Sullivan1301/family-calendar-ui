import { db } from '@/lib/drizzle/db';
import { userRoles, familyMembers, events } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import type { Role } from '@/lib/drizzle/schema';

/**
 * Vérifie si l'utilisateur est super-admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await db.query.userRoles.findFirst({
    where: and(
      eq(userRoles.userId, userId),
      eq(userRoles.role, 'super-admin')
    ),
  });
  return !!role;
}

/**
 * Récupère le rôle d'un utilisateur dans une famille
 */
export async function getUserRole(
  userId: string,
  familyId: string
): Promise<Role | null> {
  // Vérifier d'abord si super-admin
  const superAdmin = await db.query.userRoles.findFirst({
    where: and(
      eq(userRoles.userId, userId),
      eq(userRoles.role, 'super-admin')
    ),
  });

  if (superAdmin) return 'super-admin';

  // Sinon, chercher le rôle dans la famille
  const role = await db.query.userRoles.findFirst({
    where: and(
      eq(userRoles.userId, userId),
      eq(userRoles.familyId, familyId)
    ),
  });

  return role?.role ?? null;
}

/**
 * Vérifie si l'utilisateur peut gérer une famille (admin ou super-admin)
 */
export async function canManageFamily(
  userId: string,
  familyId: string
): Promise<boolean> {
  const role = await getUserRole(userId, familyId);
  return role === 'super-admin' || role === 'admin';
}

/**
 * Vérifie si l'utilisateur est membre d'une famille
 */
export async function isFamilyMember(
  userId: string,
  familyId: string
): Promise<boolean> {
  const member = await db.query.familyMembers.findFirst({
    where: and(
      eq(familyMembers.userId, userId),
      eq(familyMembers.familyId, familyId),
      eq(familyMembers.status, 'active')
    ),
  });
  return !!member;
}

/**
 * Vérifie si l'utilisateur peut modifier un événement
 */
export async function canEditEvent(
  userId: string,
  eventId: string
): Promise<boolean> {
  // Récupérer l'événement
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) return false;

  // Super-admin peut tout modifier
  if (await isSuperAdmin(userId)) return true;

  // Admin de la famille peut tout modifier
  if (await canManageFamily(userId, event.familyId)) return true;

  // Le créateur peut modifier son propre événement
  return event.createdBy === userId;
}

/**
 * Vérifie si l'utilisateur peut approuver un événement
 */
export async function canApproveEvent(
  userId: string,
  familyId: string
): Promise<boolean> {
  return canManageFamily(userId, familyId);
}

/**
 * Vérifie si l'utilisateur peut supprimer un événement
 */
export async function canDeleteEvent(
  userId: string,
  eventId: string
): Promise<boolean> {
  // Mêmes permissions que edit
  return canEditEvent(userId, eventId);
}

/**
 * Vérifie si l'utilisateur peut voir un événement
 */
export async function canViewEvent(
  userId: string,
  familyId: string
): Promise<boolean> {
  // Super-admin peut voir tout
  if (await isSuperAdmin(userId)) return true;

  // Membre actif de la famille
  return isFamilyMember(userId, familyId);
}

/**
 * Génère un code d'invitation aléatoire
 */
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Vérifie si un utilisateur peut inviter dans une famille
 */
export async function canInviteToFamily(
  userId: string,
  familyId: string
): Promise<boolean> {
  return canManageFamily(userId, familyId);
}
