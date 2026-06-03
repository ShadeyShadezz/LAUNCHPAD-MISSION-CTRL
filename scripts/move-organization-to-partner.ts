import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureFallbackUserId(): Promise<string> {
  const existing = await prisma.user.findFirst({ where: { role: 'ADMINISTRATOR' }, select: { id: true } });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      email: 'migration-admin@launchpad.local',
      passwordHash: 'migrated-account',
      fullName: 'Migration Admin',
      role: 'ADMINISTRATOR',
      title: 'Migration System User',
      accessLevel: 'admin',
    },
    select: { id: true },
  });

  return created.id;
}

async function main() {
  const fallbackUserId = await ensureFallbackUserId();
  const organizations = await prisma.organization.findMany({ orderBy: { createdAt: 'asc' } });

  let createdCount = 0;
  let updatedCount = 0;

  for (const org of organizations) {
    const existingPartner = await prisma.partner.findFirst({
      where: { organizationName: org.name },
      select: { id: true },
    });

    if (existingPartner) {
      await prisma.partner.update({
        where: { id: existingPartner.id },
        data: {
          logoUrl: org.logoUrl ?? null,
          industry: org.industry ?? null,
          description: org.description ?? null,
          websiteUrl: org.website ?? null,
          officialStatusDate: org.partnershipDate ?? null,
          partnerStatus: org.status || 'Active',
        },
      });
      updatedCount += 1;
      continue;
    }

    const partner = await prisma.partner.create({
      data: {
        organizationName: org.name,
        logoUrl: org.logoUrl ?? null,
        industry: org.industry ?? null,
        description: org.description ?? null,
        websiteUrl: org.website ?? null,
        officialStatusDate: org.partnershipDate ?? null,
        partnerType: 'Legacy',
        partnerStatus: org.status || 'Active',
        currentStatusNotes: 'Migrated from Organization model.',
        tags: ['Migrated', 'Organization'],
        createdById: fallbackUserId,
      },
      select: { id: true },
    });

    const fallbackEmailBase = org.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
    await prisma.contact.create({
      data: {
        partnerId: partner.id,
        contactType: 'PRIMARY',
        name: `${org.name} Primary Contact`,
        email: `partnerships@${fallbackEmailBase || 'organization'}.example`,
        title: 'Partnership Contact',
      },
    });

    createdCount += 1;
  }

  console.log(`Organization -> Partner migration complete. Created: ${createdCount}, Updated: ${updatedCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
