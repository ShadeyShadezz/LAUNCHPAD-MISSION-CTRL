# Troubleshooting Guide

## Prisma Schema Not Found

**Error:**
```
Error: Could not find Prisma Schema that is required for this command.
You can either provide it with `--schema` argument, set it as `prisma.schema` in your package.json or put it into the default location.
Checked following paths:
schema.prisma: file not found
prisma\schema.prisma: file not found
prisma\schema: directory not found
```

**Root Cause:** `npx prisma` resolves its working directory incorrectly when there's a conflicting `package-lock.json` in a parent directory (e.g., `C:\Users\<User>\`), or when the command is run from outside the project root.

**Fix:**
```bash
# Run from project root with explicit schema flag:
npx prisma generate --schema=prisma/schema.prisma

# Or use the npm script:
npm run prisma:generate
```

**Prevention:** Prisma scripts in `package.json` use the explicit `--schema` flag so they never depend on CWD resolution. The `postinstall` hook runs `prisma generate` automatically on every `npm install`.

---

## Add New Errors Below

Date: ____________
**Error:** (paste the full error)

**Root Cause:** (what caused it)

**Fix:** (steps to resolve)

**Prevention:** (how to avoid recurrence)
