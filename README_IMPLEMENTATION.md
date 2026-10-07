# État réel du projet Family Calendar

Dernière vérification : 7 octobre 2026.

Ce document remplace une version précédente qui annonçait le projet comme
« terminé » et « production-ready ». Ce n'était pas exact : le projet ne
compilait pas. Voici l'état constaté et ce qui a été corrigé.

---

## Ce qui fonctionne

Vérifié par `npx tsc --noEmit` (0 erreur), `npm test` (68 tests), `npm run
build` (33 routes) et `npm run lint` (0 erreur).

### Backend
- 33 routes API, toutes authentifiées, permissions vérifiées côté serveur
  (`apps/web/src/lib/permissions.ts`), entrées validées avec Zod.
- 14 tables Postgres, schéma appliqué sur le projet Supabase
  « Supabase Calendrier Familial » (ref `vnvoexmhvpszinofrxbd`).
- Rôles : `super-admin`, `admin`, `member`.

### Parcours utilisateur complets
- Inscription / connexion (better-auth, email + mot de passe).
- **Onboarding** : créer une famille ou en rejoindre une par code à 8
  caractères (`/onboarding`).
- **Invitations** : code de famille à partager, ou lien nominatif valable
  7 jours avec page d'acceptation (`/invitation/[token]`).
- **Membres** (`/members`) : liste réelle, validation des demandes,
  promotion/rétrogradation admin, retrait d'un membre.
- **Événements** : liste filtrable (`/events`), détail (`/events/[id]`) avec
  commentaires, RSVP et validation admin, création (`/new-event`).
- **RSVP** : présent / peut-être / absent par membre et par événement
  (table `event_responses`).
- **Administration** (`/admin`) : validation des membres et des événements.

---

## Bugs corrigés

Ces problèmes empêchaient l'application de fonctionner :

| Problème | Conséquence |
|---|---|
| `db.ts` annotait le type avec `ReturnType<typeof drizzle>` | Le schéma était effacé : `db.query` vide, **76 erreurs** de compilation sur toutes les routes |
| `toNextJsHandler` exporté comme une fonction | **L'authentification ne pouvait pas démarrer** (build en échec) |
| Zod v4 : `error.errors` au lieu de `error.issues` | 6 routes en échec de compilation |
| `const events = await query` masquait la table `events` importée | La liste d'événements plantait (variable utilisée avant déclaration) |
| `setPendingMembers` inexistant dans `/admin` | Build en échec ; validation des membres non branchée |
| Insert `userRoles` sans `onConflictDoNothing` | Violation de clé primaire si un membre rejoignait une 2ᵉ fois |
| `userRole.familyId` nullable non géré dans `/api/users/me` | Le rôle super-admin global cassait la liste des familles |
| Filtrage des dates fait en mémoire après avoir tout chargé | Remplacé par un filtrage SQL (`gte`/`lte`) |
| `eslint.config.mjs` sans `next/typescript` | **Le lint ne démarrait pas du tout** |
| Login ignorait `callbackUrl` | Un lien d'invitation était perdu après connexion |
| Navbar : `user.avatar` (champ inexistant), lien logo vers `/apps/web/public` | Avatar jamais affiché, logo cassé |

### Données factices remplacées par de vraies données
- `/members` : 8 membres codés en dur (avec âges et villes inventés) → API réelle.
- `/events` : page de détail statique → liste réelle + page de détail par id.
- `Sidebar` : membres et compteurs inventés → données réelles + sélecteur de famille.
- Tableau de bord : « Membres actifs » affichait `—`, « Validations en attente »
  filtrait sur un type qui n'existait pas, « Disponibilité moy. » affichait
  toujours `100%` → vrais compteurs.
- Jours fériés figés sur 2026 → suivent l'année affichée.

---

## Sécurité

**RLS activé sur les 14 tables, sans aucune policy** (migration
`enable_rls_deny_by_default`).

Avant, RLS était désactivé partout : la clé anon, publique dans le navigateur,
donnait accès en lecture **et en écriture** à toutes les données familiales.

La configuration en place :

| Rôle | Accès |
|---|---|
| `anon`, `authenticated` (clé publique) | aucun |
| `postgres` (via `DATABASE_URL`, `BYPASSRLS`) | complet |

Toutes les permissions sont donc vérifiées côté serveur, dans les routes API —
là où elles l'étaient déjà.

⚠️ **`supabase/rls_policies.sql` ne doit pas être appliqué.** Ces 288 lignes
reposent sur `auth.uid()` (Supabase Auth), alors que l'app utilise better-auth
avec ses propres tables. `auth.uid()` y vaut toujours NULL. Le fichier porte
désormais un avertissement en tête.

---

## Installation

```bash
cd apps/web
npm install
```

Créer `apps/web/.env.local` (déjà fait si tu travailles sur cette machine) :

```
NEXT_PUBLIC_SUPABASE_URL=https://vnvoexmhvpszinofrxbd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
DATABASE_URL=postgresql://postgres.vnvoexmhvpszinofrxbd:MOT_DE_PASSE@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
BETTER_AUTH_SECRET=<32 octets, openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Le mot de passe de la base se trouve dans Supabase > Settings > Database.

⚠️ **Le pooler est obligatoire, pas seulement recommandé** : l'hôte direct
`db.<ref>.supabase.co` ne résout pas en IPv4. Utiliser
`aws-1-eu-west-1.pooler.supabase.com` avec l'utilisateur
`postgres.<ref>`. Port 5432 en mode session, 6543 en mode transaction
(préférable sur Vercel). Après un changement de mot de passe, le pooler met
quelques secondes à le prendre en compte : un premier essai peut échouer.

Le schéma est déjà appliqué. Pour une nouvelle base :

```bash
npx drizzle-kit generate   # génère le SQL depuis src/lib/drizzle/schema.ts
npx drizzle-kit migrate    # applique
```

Puis activer RLS sans policy sur les 14 tables (voir section Sécurité).

La CLI Supabase est liée au projet (`supabase/config.toml`). Elle attend le
mot de passe dans `SUPABASE_DB_PASSWORD` :

```bash
export SUPABASE_DB_PASSWORD=...
supabase migration list    # compare l'historique local et distant
```

Attention : `supabase/migrations/` et `apps/web/src/lib/drizzle/migrations/`
décrivent le même schéma. **Drizzle fait foi**, puisque les types de l'app
dérivent de `schema.ts` — un changement fait d'abord en SQL ne remonterait
pas dans les types.

```bash
npm run dev    # http://localhost:3000
```

---

## Premier démarrage

1. Aller sur `/login`, créer un compte.
2. L'app redirige vers `/onboarding` : créer la famille.
3. Le créateur devient admin et reçoit un code d'invitation à 8 caractères.
4. Partager ce code (ou générer un lien nominatif depuis `/members`).
5. Chaque proche crée un compte, saisit le code, et rejoint le calendrier.

---

## Limites connues

À savoir avant de mettre l'app entre les mains de la famille :

- **Aucun envoi d'email.** Les invitations par lien sont créées en base, mais
  il faut copier le lien et l'envoyer soi-même (WhatsApp, SMS…). Brancher
  Resend ou SendGrid dans `/api/families/[id]/invitations` pour automatiser.
- **Pas de réinitialisation de mot de passe.** Sans service d'email, un mot de
  passe oublié demande une intervention en base.
- **Temps réel inactif.** Les hooks de `src/hooks/useRealtime.ts` existent mais
  ne sont appelés nulle part, et RLS sans policy bloque le canal Realtime de la
  clé anon. Les pages se rafraîchissent après chaque action, ce qui suffit à
  l'usage familial. Activer le temps réel demanderait des policies dédiées.
- **Pas d'export PDF/ICS** malgré ce que suggéraient d'anciennes maquettes.
- **Anniversaires approximatifs** : il n'y a pas de date de naissance en base.
  Le type d'événement « autre » fait office d'anniversaire dans les compteurs.
- **Recherche globale** de la barre de navigation non implémentée.
- 65 avertissements ESLint subsistent (surtout `any` et imports inutilisés) —
  dette de style, sans effet fonctionnel.
