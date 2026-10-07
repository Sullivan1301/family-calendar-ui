-- Tout l'accès aux données passe par les routes API Next.js, qui se connectent
-- via DATABASE_URL avec le rôle postgres (BYPASSRLS). Les permissions sont
-- vérifiées côté serveur dans apps/web/src/lib/permissions.ts.
-- RLS activé sans policy = aucun accès pour anon/authenticated, donc la clé
-- anon exposée dans le navigateur ne donne accès à rien.
--
-- Ne pas appliquer supabase/rls_policies.sql : ces policies reposent sur
-- auth.uid() (Supabase Auth) alors que l'app utilise better-auth.
ALTER TABLE "public"."account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_guests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."families" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."verification" ENABLE ROW LEVEL SECURITY;
