# Family Calendar - Guide d'implémentation Backend

## ✅ Implémentations complétées

### 1. Configuration de l'environnement
- ✅ Variables d'environnement pour Supabase et better-auth
- ✅ Fichier `.env.example` créé
- ✅ Configuration Drizzle ORM avec PostgreSQL

### 2. Schéma de base de données (Drizzle)
**Fichier :** `apps/web/src/lib/drizzle/schema.ts`

Tables implémentées :
- ✅ `users` - Utilisateurs (compatible better-auth)
- ✅ `user_roles` - Rôles par famille (super-admin, admin, member)
- ✅ `families` - Groupes familiaux avec code d'invitation
- ✅ `family_members` - Liaison utilisateur-famille
- ✅ `invitations` - Invitations par email avec token
- ✅ `events` - Événements calendrier avec statut d'approbation
- ✅ `event_guests` - Invités externes aux événements
- ✅ `event_history` - Audit trail des modifications
- ✅ `event_comments` - Commentaires sur événements
- ✅ `notifications` - Notifications utilisateur

Types TypeScript exportés :
- ✅ `Role`, `Status`, `EventStatus`, `EventType`, `InvitationStatus`, `HistoryAction`, `NotificationType`

### 3. Authentification (better-auth)
**Fichiers :**
- `apps/web/src/lib/auth/config.ts` - Configuration better-auth
- `apps/web/src/lib/auth/client.ts` - Client browser
- `apps/web/src/app/api/auth/[...all]/route.ts` - Handler API
- `apps/web/src/context/AuthContext.tsx` - Context React avec gestion des rôles
- `apps/web/src/app/login/page.tsx` - Page login/register

Fonctionnalités :
- ✅ Inscription avec email/mot de passe
- ✅ Connexion sécurisée
- ✅ Récupération automatique des rôles depuis la base de données
- ✅ Détermination automatique `isAdmin` et `isSuperAdmin`
- ✅ Rafraîchissement de session

### 4. API REST - Familles
**Endpoints implémentés :**

| Endpoint | Méthode | Fichier | Statut |
|----------|---------|---------|--------|
| `/api/families` | GET | `families/route.ts` | ✅ |
| `/api/families` | POST | `families/route.ts` | ✅ |
| `/api/families/[id]` | GET | `families/[id]/route.ts` | ✅ |
| `/api/families/[id]` | PATCH | `families/[id]/route.ts` | ✅ |
| `/api/families/[id]` | DELETE | `families/[id]/route.ts` | ✅ |
| `/api/families/[id]/members` | GET | `families/[id]/members/route.ts` | ✅ |
| `/api/families/[id]/leave` | POST | `families/[id]/leave/route.ts` | ✅ |
| `/api/families/[id]/invitations` | POST | `families/[id]/invitations/route.ts` | ✅ |
| `/api/families/join-code` | POST | `families/join-code/route.ts` | ✅ |

### 5. API REST - Invitations
| Endpoint | Méthode | Fichier | Statut |
|----------|---------|---------|--------|
| `/api/invitations/[token]/accept` | POST | `invitations/[token]/accept/route.ts` | ✅ |
| `/api/invitations/[token]/decline` | POST | `invitations/[token]/decline/route.ts` | ✅ |

### 6. API REST - Événements
| Endpoint | Méthode | Fichier | Statut |
|----------|---------|---------|--------|
| `/api/events` | GET | `events/route.ts` | ✅ |
| `/api/events` | POST | `events/route.ts` | ✅ |
| `/api/events/[id]` | GET | `events/[id]/route.ts` | ✅ |
| `/api/events/[id]` | PATCH | `events/[id]/route.ts` | ✅ |
| `/api/events/[id]` | DELETE | `events/[id]/route.ts` | ✅ |
| `/api/events/[id]/approve` | POST | `events/[id]/approve/route.ts` | ✅ |
| `/api/events/[id]/reject` | POST | `events/[id]/reject/route.ts` | ✅ |
| `/api/events/[id]/comments` | GET | `events/[id]/comments/route.ts` | ✅ |
| `/api/events/[id]/comments` | POST | `events/[id]/comments/route.ts` | ✅ |
| `/api/events/[id]/history` | GET | `events/[id]/history/route.ts` | ✅ |

### 7. API REST - Notifications
| Endpoint | Méthode | Fichier | Statut |
|----------|---------|---------|--------|
| `/api/notifications` | GET | `notifications/route.ts` | ✅ |
| `/api/notifications` | PATCH | `notifications/route.ts` | ✅ |
| `/api/notifications/read-all` | PATCH | `notifications/read-all/route.ts` | ✅ |
| `/api/notifications/[id]` | PATCH | `notifications/[id]/route.ts` | ✅ |
| `/api/notifications/[id]` | DELETE | `notifications/[id]/route.ts` | ✅ |

### 8. API REST - Utilisateurs
| Endpoint | Méthode | Fichier | Statut |
|----------|---------|---------|--------|
| `/api/users/me/roles` | GET | `users/me/roles/route.ts` | ✅ |

### 9. Système de permissions
**Fichier :** `apps/web/src/lib/permissions.ts`

Fonctions implémentées :
- ✅ `isSuperAdmin(userId)` - Vérifie si super-admin
- ✅ `getUserRole(userId, familyId)` - Récupère le rôle dans une famille
- ✅ `canManageFamily(userId, familyId)` - Vérifie permissions famille
- ✅ `isFamilyMember(userId, familyId)` - Vérifie l'appartenance
- ✅ `canEditEvent(userId, eventId)` - Vérifie permission modification événement
- ✅ `canApproveEvent(userId, familyId)` - Vérifie permission approbation
- ✅ `canDeleteEvent(userId, eventId)` - Vérifie permission suppression
- ✅ `canViewEvent(userId, familyId)` - Vérifie permission lecture
- ✅ `canInviteToFamily(userId, familyId)` - Vérifie permission invitation
- ✅ `generateInvitationCode()` - Génère code 8 caractères

### 10. Temps réel (Supabase Realtime)
**Fichier :** `apps/web/src/hooks/useRealtime.ts`

Hooks implémentés :
- ✅ `useRealtimeEvents({ familyId, callbacks })` - Écoute changements événements
- ✅ `useRealtimeComments({ eventId, callback })` - Écoute nouveaux commentaires
- ✅ `useRealtimeNotifications({ userId, callback })` - Écoute notifications avec compteur
- ✅ `useCalendarRealtime(familyId, userId, callbacks)` - Hook combiné complet

### 11. Frontend connecté
- ✅ Formulaire de création d'événement (`/new-event`) connecté à l'API
- ✅ Page de login/register (`/login`) fonctionnelle
- ✅ AuthContext avec récupération automatique des rôles

---

## 🚀 Configuration initiale

### 1. Configurer Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Récupérer les credentials dans Settings > API
3. Mettre à jour `.env.local` :
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
   SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
   DATABASE_URL=postgresql://postgres:motdepasse@db.xxx.supabase.co:5432/postgres
   ```

### 2. Générer le secret better-auth

```bash
openssl rand -base64 32
# ou
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Mettre à jour `.env.local` :
```bash
BETTER_AUTH_SECRET=<secret-généré>
```

### 3. Exécuter les migrations Drizzle

```bash
cd apps/web
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Configurer Supabase Realtime

Dans le dashboard Supabase :
1. Aller à Database > Replication
2. Activer Realtime pour les tables :
   - `events`
   - `event_comments`
   - `notifications`

### 5. Démarrer le serveur

```bash
npm run dev
```

Accéder à :
- Login : http://localhost:3000/login
- Dashboard : http://localhost:3000
- Créer événement : http://localhost:3000/new-event

---

## 📋 Workflows utilisateur

### Création de famille
1. Utilisateur authentifié
2. POST `/api/families` avec `{ name: "Ma Famille" }`
3. Réponse : famille créée avec code d'invitation
4. L'utilisateur devient automatiquement admin

### Rejoindre par code
1. POST `/api/families/join-code` avec `{ code: "ABC12345" }`
2. Utilisateur ajouté comme membre avec rôle `member`

### Invitation par email
1. Admin POST `/api/families/[id]/invitations` avec `{ email: "user@example.com" }`
2. Invitation créée avec token UUID (expire dans 7 jours)
3. Utilisateur clique sur lien `/invitation/[token]`
4. POST `/api/invitations/[token]/accept` pour accepter

### Création d'événement
1. Member POST `/api/events` → statut `pending`
2. Admin POST `/api/events` → statut `approved` automatiquement
3. Si pending, notification envoyée aux admins

### Approbation d'événement
1. Admin POST `/api/events/[id]/approve`
2. Statut changé à `approved`
3. Notification envoyée au créateur

---

## 🔒 Sécurité

### Authentification
- ✅ Sessions sécurisées via better-auth
- ✅ Hash automatique des mots de passe
- ✅ Support OAuth Google (configurable)

### Autorisation
- ✅ Vérification de session sur chaque endpoint
- ✅ Permissions basées sur les rôles
- ✅ RLS policies Supabase (à implémenter côté DB)

### Validation
- ✅ Validation Zod sur toutes les entrées
- ✅ Protection contre les injections SQL (Drizzle ORM)
- ✅ Sanitization des données

---

## 🎯 Prochaines étapes recommandées

1. **RLS Policies** : Implémenter les policies SQL dans Supabase (voir doc d'architecture)
2. **Emails** : Intégrer un service d'emails (Resend, SendGrid) pour les invitations
3. **Middleware** : Créer un middleware Next.js pour protéger les routes
4. **Tests** : Ajouter des tests unitaires et d'intégration
5. **Upload fichiers** : Ajouter le support des pièces jointes aux événements
6. **Recherche** : Implémenter la recherche full-text sur les événements
7. **Export** : Export PDF/ICS des calendriers
8. **PWA** : Rendre l'app installable avec offline support

---

## 🐛 Troubleshooting

### Erreur de connexion à la base de données
- Vérifier que `DATABASE_URL` est correct
- S'assurer que l'IP est autorisée dans Supabase

### better-auth ne fonctionne pas
- Vérifier que `BETTER_AUTH_SECRET` fait au moins 32 caractères
- Vérifier que `BETTER_AUTH_URL` correspond à l'URL réelle

### Realtime ne fonctionne pas
- Activer Realtime dans le dashboard Supabase
- Vérifier que les variables Supabase sont correctes

### Erreur de permissions
- Vérifier que l'utilisateur a un rôle dans `user_roles`
- Vérifier que le membre est `active` dans `family_members`

---

## 📚 Ressources

- [better-auth documentation](https://www.better-auth.com)
- [Drizzle ORM documentation](https://orm.drizzle.team)
- [Supabase documentation](https://supabase.com/docs)
- [Next.js documentation](https://nextjs.org/docs)
