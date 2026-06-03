/**
 * API route contract tests.
 * Tests expected response shapes and status codes.
 * Run with: npx ts-node tests/api-contracts.test.ts
 *
 * NOTE: These tests require the application server to be running on localhost:3000.
 * Run `npm run dev` in a separate terminal first.
 */

const BASE = 'http://localhost:3000';

let passed = 0;
let failed = 0;
let totalTests = 0;

async function test(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL: ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

async function assertResponse(
  path: string,
  expectedStatus: number,
  checkBody?: (body: any) => boolean
) {
  const res = await fetch(`${BASE}${path}`);
  if (res.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} but got ${res.status} for GET ${path}`);
  }
  if (checkBody) {
    const body = await res.json().catch(() => null);
    if (!checkBody(body)) {
      throw new Error(`Body check failed for GET ${path}: ${JSON.stringify(body).slice(0, 200)}`);
    }
  }
}

async function main() {
  console.log('=== API Contract Tests ===\n');
  console.log('NOTE: Start the dev server with `npm run dev` before running these tests.\n');

  // Auth routes
  await test('POST /api/auth/login returns 400 without credentials', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.status !== 400) throw new Error(`Expected 400 got ${res.status}`);
    const body = await res.json();
    if (!body.error) throw new Error('Expected error message');
  });

  await test('POST /api/auth/logout returns success', async () => {
    const res = await fetch(`${BASE}/api/auth/logout`, { method: 'POST' });
    if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
  });

  // Partners route
  await test('GET /api/partners returns 401 without auth', async () => {
    await assertResponse('/api/partners', 401, (body) => body?.error != null);
  });

  // Partnerships route (admin-only)
  await test('GET /api/partnerships returns 401 without auth', async () => {
    await assertResponse('/api/partnerships', 401, (body) => body?.error != null);
  });

  // Staff route
  await test('GET /api/staff returns 401 without auth', async () => {
    await assertResponse('/api/staff', 401, (body) => body?.error != null);
  });

  // Staff notes route
  await test('GET /api/staff-notes returns 401 without auth', async () => {
    await assertResponse('/api/staff-notes', 401, (body) => body?.error != null);
  });

  // Activity logs route
  await test('GET /api/activity-logs returns 401 without auth', async () => {
    await assertResponse('/api/activity-logs', 401, (body) => body?.error != null);
  });

  // Email generate route
  await test('POST /api/email/generate returns 401 without auth', async () => {
    const res = await fetch(`${BASE}/api/email/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: 'nonexistent' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  // Interactions route
  await test('GET /api/interactions returns 401 without auth', async () => {
    await assertResponse('/api/interactions', 401, (body) => body?.error != null);
  });

  // Page routes (should return HTML, not 404)
  await test('GET /login returns 200', async () => {
    const res = await fetch(`${BASE}/login`);
    if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    const text = await res.text();
    if (!text.includes('</html>')) throw new Error('Expected HTML response');
  });

  await test('GET / returns 200 (redirects to login or dashboard)', async () => {
    const res = await fetch(`${BASE}/`, { redirect: 'manual' });
    if (res.status !== 200 && res.status !== 307 && res.status !== 302) {
      throw new Error(`Expected 200/302/307 got ${res.status}`);
    }
  });

  // Verify no unmatched route returns 404
  await test('No 404s for defined page routes', async () => {
    const pages = [
      '/dashboard',
      '/partners',
      '/partnerships',
      '/email',
      '/interactions',
      '/activity-log',
      '/settings',
      '/search',
      '/staff-notes',
    ];
    for (const page of pages) {
      const res = await fetch(`${BASE}${page}`, { redirect: 'manual' });
      if (res.status === 404) {
        throw new Error(`Page ${page} returned 404`);
      }
    }
  });

  console.log(`\n=== Results: ${passed}/${totalTests} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
