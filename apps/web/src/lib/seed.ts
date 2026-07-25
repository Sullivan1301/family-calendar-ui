import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import * as schema from './drizzle/schema';

config({ path: '.env.local' });

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Create a .env.local file first.');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema: { ...schema } });

  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const [superAdmin] = await db
    .insert(schema.users)
    .values({
      id: 'super-admin-001',
      email: 'sullivan@tba.mg',
      name: 'Sullivan',
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  const adminId = superAdmin?.id || 'super-admin-001';

  await db
    .insert(schema.accounts)
    .values({
      id: 'account-admin-001',
      userId: adminId,
      accountId: adminId,
      providerId: 'credential',
      password: hashedPassword,
    })
    .onConflictDoNothing();

  const [family] = await db
    .insert(schema.families)
    .values({
      name: 'Famille TBA',
      invitationCode: 'TBA2026X',
      createdBy: adminId,
    })
    .returning();

  console.log(`  Created family: ${family.name} (code: ${family.invitationCode})`);

  await db.insert(schema.userRoles).values({
    userId: adminId,
    familyId: family.id,
    role: 'super-admin',
  });

  await db.insert(schema.familyMembers).values({
    familyId: family.id,
    userId: adminId,
    status: 'active',
  });

  const members = [
    { id: 'member-anja', email: 'anja@tba.mg', name: 'Anja', password: 'anja123' },
    { id: 'member-tahina', email: 'tahina@tba.mg', name: 'Tahina', password: 'tahina123' },
    { id: 'member-yasina', email: 'yasina@tba.mg', name: 'Yasina', password: 'yasina123' },
    { id: 'member-rina', email: 'rina@tba.mg', name: 'Rina', password: 'rina123' },
  ];

  for (const m of members) {
    const hash = await bcrypt.hash(m.password, 10);

    const [user] = await db
      .insert(schema.users)
      .values({
        id: m.id,
        email: m.email,
        name: m.name,
        emailVerified: true,
      })
      .onConflictDoNothing()
      .returning();

    if (user) {
      await db.insert(schema.accounts).values({
        id: `account-${m.id}`,
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hash,
      });

      await db.insert(schema.familyMembers).values({
        familyId: family.id,
        userId: user.id,
        status: 'active',
        invitedBy: adminId,
      });

      await db.insert(schema.userRoles).values({
        userId: user.id,
        familyId: family.id,
        role: 'member',
      });

      console.log(`  Added member: ${m.name} (${m.email})`);
    }
  }

  const now = new Date();
  const sampleEvents = [
    {
      title: 'Anniversaire de Yasina',
      type: 'autre' as const,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      location: 'Toamasina',
      status: 'approved' as const,
      createdBy: 'member-yasina',
    },
    {
      title: 'Mariage de Rina',
      type: 'mariage' as const,
      startDate: new Date(now.getFullYear(), 7, 15),
      location: 'Antananarivo',
      status: 'approved' as const,
      createdBy: 'member-rina',
      description: 'Grand mariage familial à Antananarivo',
    },
    {
      title: 'Vacances Foulpointe',
      type: 'autre' as const,
      startDate: new Date(now.getFullYear(), 11, 20),
      endDate: new Date(now.getFullYear(), 11, 27),
      location: 'Foulpointe',
      status: 'approved' as const,
      createdBy: adminId,
      description: 'Vacances de fin d\'année en famille',
    },
    {
      title: "Baptême de Nayah",
      type: 'baptême' as const,
      startDate: new Date(now.getFullYear(), 4, 22),
      location: 'Antsirabe',
      status: 'pending' as const,
      createdBy: 'member-tahina',
    },
  ];

  for (const e of sampleEvents) {
    const [event] = await db
      .insert(schema.events)
      .values({
        familyId: family.id,
        ...e,
        approvedBy: e.status === 'approved' ? adminId : null,
      })
      .returning();

    console.log(`  Created event: ${event.title} (${event.status})`);
  }

  await db.insert(schema.notifications).values([
    {
      userId: adminId,
      type: 'event_invitation',
      title: 'Nouvel événement en attente',
      message: 'Tahina a créé "Baptême de Nayah"',
      data: { familyId: family.id },
    },
    {
      userId: 'member-anja',
      type: 'family_invitation',
      title: 'Bienvenue !',
      message: 'Vous avez rejoint la Famille TBA',
      data: { familyId: family.id },
      read: true,
    },
  ]);

  console.log('\nSeed complete!');
  console.log('\nLogin credentials:');
  console.log('  Super Admin: sullivan@tba.mg / admin123');
  console.log('  Members:     anja@tba.mg / anja123');
  console.log('               tahina@tba.mg / tahina123');
  console.log('               yasina@tba.mg / yasina123');
  console.log('               rina@tba.mg / rina123');
  console.log(`  Family code: ${family.invitationCode}`);

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
