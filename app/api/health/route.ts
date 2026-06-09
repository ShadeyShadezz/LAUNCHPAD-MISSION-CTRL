import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
  const missingEnv: string[] = [];

  if (!process.env.DATABASE_URL) missingEnv.push('DATABASE_URL');
  if (!process.env.JWT_SECRET) missingEnv.push('JWT_SECRET');

  const diagnostics = {
    ok: false,
    timestamp: new Date().toISOString(),
    checks: {
      env: {
        ok: missingEnv.length === 0,
        missing: missingEnv,
      },
      database: {
        ok: false,
        error: null as string | null,
      },
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.checks.database.ok = true;
  } catch (error) {
    diagnostics.checks.database.error = error instanceof Error ? error.message : 'Unknown database error';
  }

  diagnostics.ok = diagnostics.checks.env.ok && diagnostics.checks.database.ok;

  return NextResponse.json(diagnostics, { status: diagnostics.ok ? 200 : 503 });
}
