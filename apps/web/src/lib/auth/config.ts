import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/drizzle/db';
import * as schema from '@/lib/drizzle/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      // better-auth génère automatiquement les tables de session, account, etc.
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  callbacks: {
    async afterCreateUser(user) {
      // Créer automatiquement un rôle member par défaut
      // (sera remplacé quand l'utilisateur rejoint une famille)
      console.log('User created:', user);
    },
  },
});
