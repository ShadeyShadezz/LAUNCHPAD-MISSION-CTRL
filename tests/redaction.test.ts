/**
 * Tests for the sanitizePromptValue function used in the email generation route.
 * Run with: npx ts-node tests/redaction.test.ts
 */

// Inline copy of the sanitize function from app/api/email/generate/route.ts
function sanitizePromptValue(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[redacted-phone]')
    .replace(/https?:\/\/\S+/gi, '[redacted-url]')
    .slice(0, 600);
}

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${name}`);
  } else {
    failed++;
    console.error(`  FAIL: ${name}`);
  }
}

console.log('=== sanitizePromptValue tests ===\n');

// Non-string input
assert('returns empty string for undefined', sanitizePromptValue(undefined) === '');
assert('returns empty string for number', sanitizePromptValue(42) === '');
assert('returns empty string for null', sanitizePromptValue(null) === '');
assert('returns empty string for object', sanitizePromptValue({}) === '');

// Email redaction
const emailTest = sanitizePromptValue('Contact me at test@example.com');
assert('redacts email addresses', emailTest.includes('[redacted-email]') && !emailTest.includes('test@example.com'));

const multipleEmails = sanitizePromptValue('a@b.com and c@d.org');
assert('redacts multiple emails', multipleEmails.match(/\[redacted-email\]/g)?.length === 2);

const uppercaseEmail = sanitizePromptValue('USER@EXAMPLE.COM');
assert('redacts uppercase emails', uppercaseEmail.includes('[redacted-email]') && !uppercaseEmail.includes('USER@EXAMPLE.COM'));

// Phone redaction
const phoneTest = sanitizePromptValue('Call +1-555-123-4567');
assert('redacts phone numbers', phoneTest.includes('[redacted-phone]') && !phoneTest.includes('555-123-4567'));

const phoneNoCountry = sanitizePromptValue('Call 555-123-4567');
assert('redacts domestic phone numbers', phoneNoCountry.includes('[redacted-phone]'));

// URL redaction
const urlTest = sanitizePromptValue('Visit https://example.com/page');
assert('redacts URLs', urlTest.includes('[redacted-url]') && !urlTest.includes('https://example.com'));

const httpUrl = sanitizePromptValue('Visit http://example.com');
assert('redacts http URLs', httpUrl.includes('[redacted-url]'));

const urlWithPath = sanitizePromptValue('See https://app.example.com/dashboard?user=123');
assert('redacts complex URLs', urlWithPath.includes('[redacted-url]'));

// Truncation
const longString = 'x'.repeat(1000);
const truncated = sanitizePromptValue(longString);
assert('truncates to 600 characters', truncated.length === 600);
assert('preserves prefix content', truncated.startsWith('x'.repeat(100)));

// Normal string passthrough
const normal = sanitizePromptValue('Hello, this is a normal message');
assert('passes through normal strings', normal === 'Hello, this is a normal message');

// Empty string
assert('returns empty for empty string', sanitizePromptValue('') === '');

// Whitespace trim
assert('trims whitespace', sanitizePromptValue('  hello  ') === 'hello');

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
