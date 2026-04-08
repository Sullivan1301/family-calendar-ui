# Family Calendar - Architecture Backend

**Date:** 2026-04-08  
**Scope:** Migration du frontend mocké vers un backend complet avec API REST, WebSockets temps réel, authentification et gestion multi-familles.

---

## 1. Objectifs

- Remplacer l'authentification mockée (hardcoded) par better-auth + Supabase
- Implémenter la gestion des familles (création, invitations, codes)
- API REST sécurisée pour les événements calendrier
- Synchronisation temps réel via Supabase Realtime
- Système de rôles (super-admin, admin famille, membre)

---

## 2. Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (API Routes) |
| Base de données | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| Auth | better-auth (Drizzle adapter) |
| Temps réel | Supabase Realtime |
| Validation | Zod |

---

## 3. Structure du Projet

```
apps/web/src/
├── app/
│   ├── api/                    # API Routes Next.js
│   │   ├── auth/[...all]/      # better-auth handlers
│   │   ├── families/
│   │   ├── events/
│   │   └── notifications/
│   └── (pages)/                # Pages existantes
├── lib/
│   ├── supabase/               # Client + Realtime
│   ├── drizzle/                # Schéma + migrations
│   ├── auth/                   # Config better-auth
│   └── permissions.ts          # Vérifications rôles
├── hooks/
│   └── useRealtime.ts          # Hook temps réel
└── types/
    └── api.ts                  # Types API
```

---

## 4. Modèle de Données (Drizzle)

### 4.1 Tables better-auth (automatiques)

```typescript
// Gérées par better-auth
users {
  id: string (PK)
  email: string (unique)
  emailVerified: boolean
  name: string
  image: string (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}

accounts, sessions, verifications... // better-auth tables
```

### 4.2 Tables Application

```typescript
// user_roles - Rôles personnalisés par famille
user_roles {
  userId: string (FK → users.id)
  familyId: string (FK → families.id, nullable pour super-admin)
  role: enum('super-admin' | 'admin' | 'member')
  createdAt: timestamp
  PK: (userId, familyId)
}

// families - Groupes familiaux
families {
  id: string (PK)
  name: string
  invitationCode: string (unique, 8 caractères alphanum)
  createdBy: string (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}

// family_members - Liaison utilisateur-famille
family_members {
  id: string (PK)
  familyId: string (FK → families.id)
  userId: string (FK → users.id)
  joinedAt: timestamp
  invitedBy: string (FK → users.id, nullable)
  status: enum('pending' | 'active' | 'rejected')
}

// invitations - Invitations par email
invitations {
  id: string (PK)
  familyId: string (FK → families.id)
  email: string
  invitedBy: string (FK → users.id)
  token: string (unique, UUID)
  expiresAt: timestamp
  status: enum('pending' | 'accepted' | 'expired' | 'revoked')
  createdAt: timestamp
}

// events - Événements calendrier
events {
  id: string (PK)
  familyId: string (FK → families.id)
  title: string
  type: enum('mariage' | 'baptême' | 'anniversaire de décès' | 'événement global' | 'autre')
  description: text (nullable)
  startDate: timestamp
  endDate: timestamp (nullable)
  location: string (nullable)
  status: enum('pending' | 'approved' | 'rejected')
  createdBy: string (FK → users.id)
  approvedBy: string (FK → users.id, nullable)
  createdAt: timestamp
  updatedAt: timestamp
}

// event_guests - Invités externes aux événements
event_guests {
  id: string (PK)
  eventId: string (FK → events.id)
  name: string
  email: string (nullable)
  confirmed: boolean (default: false)
}

// event_history - Audit trail
event_history {
  id: string (PK)
  eventId: string (FK → events.id)
  userId: string (FK → users.id)
  action: enum('created' | 'updated' | 'deleted' | 'approved' | 'rejected')
  changes: jsonb (diff avant/après)
  createdAt: timestamp
}

// event_comments - Commentaires sur événements
event_comments {
  id: string (PK)
  eventId: string (FK → events.id)
  userId: string (FK → users.id)
  content: text
  createdAt: timestamp
  updatedAt: timestamp
}

// notifications - Notifications utilisateur
notifications {
  id: string (PK)
  userId: string (FK → users.id)
  type: enum('event_invitation' | 'event_approved' | 'event_rejected' | 
              'family_invitation' | 'comment_added' | 'member_joined')
  title: string
  message: string
  data: jsonb (contexte: eventId, familyId, etc.)
  read: boolean (default: false)
  createdAt: timestamp
}
```

---

## 5. RLS Policies (Supabase)

```sql
-- familles : visible si membre ou super-admin
CREATE POLICY "families_select" ON families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_id = families.id AND user_id = auth.uid() AND status = 'active'
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super-admin'
    )
  );

-- events : visible si appartient à une famille accessible
CREATE POLICY "events_select" ON events
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super-admin'
    )
  );

-- event_history : visible si event accessible
-- event_comments : visible si event accessible
-- notifications : visible uniquement par destinataire
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());
```

---

## 6. API REST

### 6.1 Auth (better-auth)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/[...all]` | ALL | Endpoints better-auth (login, register, logout, callback) |

### 6.2 Familles

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/families` | GET | ✓ | Liste des familles de l'utilisateur |
| `/api/families` | POST | ✓ | Créer une nouvelle famille (devient admin) |
| `/api/families/:id` | GET | ✓ | Détail d'une famille |
| `/api/families/:id` | PATCH | Admin+ | Modifier la famille |
| `/api/families/:id` | DELETE | Admin+ | Supprimer la famille |
| `/api/families/:id/members` | GET | ✓ | Liste des membres |
| `/api/families/:id/leave` | POST | ✓ | Quitter la famille (sauf dernier admin) |
| `/api/families/:id/invitations` | POST | Admin+ | Créer invitation email |
| `/api/families/join-code` | POST | ✓ | Rejoindre par code d'invitation |

### 6.3 Invitations

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/invitations/:token/accept` | POST | ✓ | Accepter invitation email |
| `/api/invitations/:token/decline` | POST | ✓ | Refuser invitation |

### 6.4 Événements

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/events` | GET | ✓ | Liste événements (filtré par famille) |
| `/api/events` | POST | ✓ | Créer événement (pending si member, approved si admin) |
| `/api/events/:id` | GET | ✓ | Détail événement |
| `/api/events/:id` | PATCH | ✓ | Modifier (owner ou admin) |
| `/api/events/:id` | DELETE | ✓ | Supprimer (owner ou admin) |
| `/api/events/:id/approve` | POST | Admin+ | Approuver événement pending |
| `/api/events/:id/reject` | POST | Admin+ | Rejeter événement |
| `/api/events/:id/history` | GET | ✓ | Historique modifications |
| `/api/events/:id/comments` | GET | ✓ | Liste commentaires |
| `/api/events/:id/comments` | POST | ✓ | Ajouter commentaire |

### 6.5 Notifications

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/notifications` | GET | ✓ | Liste notifications (non lues d'abord) |
| `/api/notifications/:id/read` | PATCH | ✓ | Marquer comme lue |
| `/api/notifications/read-all` | PATCH | ✓ | Tout marquer comme lu |
| `/api/notifications/:id` | DELETE | ✓ | Supprimer notification |

---

## 7. Temps Réel (Supabase Realtime)

### 7.1 Channels

```typescript
// Channel par famille pour les événements
const eventsChannel = supabase.channel(`family:${familyId}:events`)
  .on('postgres_changes', { event: '*', table: 'events', filter: `family_id=eq.${familyId}` }, callback)
  .subscribe();

// Channel personnel pour les notifications
const notificationsChannel = supabase.channel(`user:${userId}:notifications`)
  .on('postgres_changes', { event: 'INSERT', table: 'notifications', filter: `user_id=eq.${userId}` }, callback)
  .subscribe();

// Channel par événement pour les commentaires
const commentsChannel = supabase.channel(`event:${eventId}:comments`)
  .on('postgres_changes', { event: 'INSERT', table: 'event_comments', filter: `event_id=eq.${eventId}` }, callback)
  .subscribe();
```

### 7.2 Hook React `useRealtime`

```typescript
const useRealtime = (familyId: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const channel = supabase
      .channel(`family:${familyId}`)
      .on('postgres_changes', { event: '*', table: 'events' }, (payload) => {
        // Met à jour le cache local (React Query / SWR)
      })
      .subscribe((status) => setIsConnected(status === 'SUBSCRIBED'));
      
    return () => { supabase.removeChannel(channel); };
  }, [familyId]);
  
  return { events, isConnected };
};
```

---

## 8. Permissions

### 8.1 Matrice des Rôles

| Action | Super-Admin | Admin Famille | Membre |
|--------|-------------|---------------|--------|
| Voir toutes les familles | ✓ | ✗ | ✗ |
| Créer famille | ✓ | ✓ | ✓ |
| Modifier SA famille | ✓ | ✓ | ✗ |
| Inviter membres (email) | ✓ | ✓ | ✗ |
| Gérer code invitation | ✓ | ✓ | ✗ |
| Retirer membre | ✓ | ✓ | ✗ (sauf soi) |
| Créer événement | ✓ | ✓ | ✓ (pending) |
| Modifier événement | ✓ | ✓ | ✓ (si owner) |
| Approuver/rejeter événement | ✓ | ✓ | ✗ |
| Supprimer événement | ✓ | ✓ | ✓ (si owner) |
| Voir historique | ✓ | ✓ | ✓ |

### 8.2 Fonctions Utilitaires

```typescript
// lib/permissions.ts
export async function canManageFamily(userId: string, familyId: string): Promise<boolean>;
export async function canEditEvent(userId: string, eventId: string): Promise<boolean>;
export async function canApproveEvent(userId: string, familyId: string): Promise<boolean>;
export async function getUserRole(userId: string, familyId: string): Promise<Role | null>;
```

---

## 9. Flows Utilisateur

### 9.1 Création de Famille

1. Utilisateur authentifié POST `/api/families`
2. Création famille + family_members (user comme admin) + user_roles
3. Génération code invitation automatique
4. Redirection vers la famille

### 9.2 Invitation par Email

1. Admin POST `/api/families/:id/invitations` avec email
2. Création invitation avec token UUID
3. Envoi email (à implémenter plus tard) avec lien `/invitation/:token`
4. Destinataire clique → accepte ou refuse
5. Si accepté : création family_members + suppression invitation

### 9.3 Rejoindre par Code

1. Utilisateur POST `/api/families/join-code` avec code
2. Vérification code → création family_members (status: pending ou active selon config)
3. Notification admin famille

### 9.4 Création Événement

1. Membre POST `/api/events` avec données événement
2. Si admin : status = approved directement
3. Si member : status = pending + notification admins
4. Temps réel : broadcast aux membres de la famille

---

## 10. Configuration Environnement

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Email (futur)
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=
```

---

## 11. Migrations Drizzle

Ordre de création des tables :

1. `users` (via better-auth)
2. `families`
3. `user_roles`
4. `family_members`
5. `invitations`
6. `events`
7. `event_guests`
8. `event_history`
9. `event_comments`
10. `notifications`

---

## 12. Tests

- Tests unitaires : permissions, validation Zod
- Tests intégration : API routes avec test DB
- Tests temps réel : mock Supabase Realtime

---

## 13. Livrables

- [ ] Configuration Supabase + Drizzle
- [ ] Schéma de base de données
- [ ] Setup better-auth
- [ ] API Routes (familles, événements, invitations, notifications)
- [ ] Hook useRealtime
- [ ] Middleware de protection routes
- [ ] Documentation API

---

**Prochaine étape :** Création du plan d'implémentation détaillé avec la skill `writing-plans`.
