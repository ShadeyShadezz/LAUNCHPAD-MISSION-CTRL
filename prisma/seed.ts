import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';

const prisma = new PrismaClient();

type DummyPartnerSeed = {
  organizationName: string;
  logoUrl?: string | null;
  industry?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  schoolType?: string | null;
  officialStatusDate?: string | null;
  partnerType?: string | null;
  partnerStatus?: string | null;
  currentStatusNotes?: string | null;
  earlyReleaseForSeniors?: boolean;
  courseNumber?: number | null;
  tags?: string[];
  contacts: Array<{
    name: string;
    email: string;
    title?: string | null;
    contactType: 'LEADERSHIP' | 'PRIMARY' | 'SECONDARY';
  }>;
};

async function loadDummyPartners(): Promise<DummyPartnerSeed[]> {
  const path = new URL('./data/dummyPartners.json', import.meta.url);
  const raw = await readFile(path, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as DummyPartnerSeed[]) : [];
}

async function main() {
  const dummyPartners = await loadDummyPartners();

  // Create test user (test@launchpad.com / password123)
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'test@launchpad.com' },
    update: {},
    create: {
      email: 'test@launchpad.com',
      passwordHash,
      fullName: 'Test User',
      role: 'ADMINISTRATOR',
      title: 'Test Admin',
      accessLevel: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'coordinator@launchpad.com' },
    update: {},
    create: {
      email: 'coordinator@launchpad.com',
      passwordHash,
      fullName: 'Program Coordinator',
      role: 'PROGRAM_COORDINATOR',
      title: 'Program Coordinator',
      accessLevel: 'staff',
    },
  });

  // Legacy organization records are preserved, but Partner is now the source of truth.
  const organizations = [
    {
      name: 'Launchpad Technologies',
      logoUrl: 'https://placehold.co/400?text=Launchpad',
      industry: 'Software',
      partnershipDate: new Date('2023-01-15'),
      status: 'Active',
      description: 'Cloud-based solutions for startups and enterprises.',
      website: 'https://launchpad.com',
    },
    {
      name: 'Neon Robotics',
      logoUrl: 'https://placehold.co/400?text=Neon+Robotics',
      industry: 'Robotics',
      partnershipDate: new Date('2022-11-10'),
      status: 'Active',
      description: 'AI-powered robotics for manufacturing.',
      website: 'https://neonrobotics.ai',
    },
    {
      name: 'QuantumLeap Analytics',
      logoUrl: 'https://placehold.co/400?text=QuantumLeap',
      industry: 'Data Analytics',
      partnershipDate: new Date('2024-02-20'),
      status: 'Inactive',
      description: 'Advanced analytics and business intelligence.',
      website: 'https://quantumleap.io',
    },
    {
      name: 'SkyNet Security',
      logoUrl: 'https://placehold.co/400?text=SkyNet',
      industry: 'Cybersecurity',
      partnershipDate: new Date('2023-07-01'),
      status: 'Active',
      description: 'Next-gen cybersecurity for cloud infrastructure.',
      website: 'https://skynetsecurity.com',
    },
    {
      name: 'GreenTech Innovations',
      logoUrl: 'https://placehold.co/400?text=GreenTech',
      industry: 'Clean Energy',
      partnershipDate: new Date('2022-05-18'),
      status: 'Active',
      description: 'Sustainable energy solutions for a greener planet.',
      website: 'https://greentech.com',
    },
    {
      name: 'MedAI Health',
      logoUrl: 'https://placehold.co/400?text=MedAI',
      industry: 'Healthcare AI',
      partnershipDate: new Date('2023-09-12'),
      status: 'Inactive',
      description: 'AI-driven diagnostics and patient care.',
      website: 'https://medaihealth.com',
    },
    {
      name: 'EduVerse',
      logoUrl: 'https://placehold.co/400?text=EduVerse',
      industry: 'EdTech',
      partnershipDate: new Date('2024-01-05'),
      status: 'Active',
      description: 'Immersive learning platforms for schools.',
      website: 'https://eduverse.org',
    },
    {
      name: 'FinSight',
      logoUrl: 'https://placehold.co/400?text=FinSight',
      industry: 'FinTech',
      partnershipDate: new Date('2022-10-22'),
      status: 'Inactive',
      description: 'Financial analytics and investment tools.',
      website: 'https://finsight.com',
    },
    {
      name: 'UrbanAI Mobility',
      logoUrl: 'https://placehold.co/400?text=UrbanAI',
      industry: 'Mobility',
      partnershipDate: new Date('2023-03-30'),
      status: 'Active',
      description: 'Smart mobility solutions for urban areas.',
      website: 'https://urbanai.com',
    },
    {
      name: 'PixelForge Studios',
      logoUrl: 'https://placehold.co/400?text=PixelForge',
      industry: 'Digital Media',
      partnershipDate: new Date('2022-12-14'),
      status: 'Active',
      description: 'Creative digital content and media production.',
      website: 'https://pixelforge.com',
    },
  ];

  for (const org of organizations) {
    await prisma.organization.upsert({
      where: { name: org.name },
      update: org,
      create: org,
    });
  }

  // Move organization attributes into Partner records so Display uses Partner as canonical source.
  const allOrganizations = await prisma.organization.findMany();
  for (const org of allOrganizations) {
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
    } else {
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
          currentStatusNotes: 'Migrated from Organization model during Partner-first consolidation.',
          tags: ['Migrated', 'Organization'],
          createdById: adminUser.id,
        },
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
    }
  }

  // Seed deterministic dummy partners that should always exist on Partners/Display pages.
  for (const partnerSeed of dummyPartners) {
    const existing = await prisma.partner.findFirst({
      where: { organizationName: partnerSeed.organizationName },
      select: { id: true },
    });

    const data = {
      organizationName: partnerSeed.organizationName,
      logoUrl: partnerSeed.logoUrl ?? null,
      industry: partnerSeed.industry ?? null,
      description: partnerSeed.description ?? null,
      websiteUrl: partnerSeed.websiteUrl ?? null,
      schoolType: partnerSeed.schoolType ?? null,
      officialStatusDate: partnerSeed.officialStatusDate ? new Date(partnerSeed.officialStatusDate) : null,
      courseNumber: partnerSeed.courseNumber ?? null,
      partnerType: partnerSeed.partnerType ?? null,
      partnerStatus: partnerSeed.partnerStatus ?? 'Active',
      currentStatusNotes: partnerSeed.currentStatusNotes ?? null,
      earlyReleaseForSeniors: partnerSeed.earlyReleaseForSeniors ?? false,
      tags: partnerSeed.tags ?? [],
      createdById: adminUser.id,
    };

    const partner = existing
      ? await prisma.partner.update({ where: { id: existing.id }, data })
      : await prisma.partner.create({ data });

    await prisma.contact.deleteMany({ where: { partnerId: partner.id } });
    if (partnerSeed.contacts.length > 0) {
      await prisma.contact.createMany({
        data: partnerSeed.contacts.map((contact) => ({
          partnerId: partner.id,
          name: contact.name,
          email: contact.email,
          title: contact.title ?? null,
          contactType: contact.contactType,
        })),
      });
    }
  }

  console.log('Seed data created successfully. Partner records are now the canonical display source.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
