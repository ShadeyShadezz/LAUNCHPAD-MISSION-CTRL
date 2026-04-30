# Fix Dashboard Fetch & Backend Error Handling

- [x] Analyze error and gather context
- [x] Fix `CtrlRoom/frontend/app/dashboard/page.tsx`
  - [x] Refactor `fetchDashboardData` with `useCallback`, define before `useEffect`
  - [x] Update `useEffect` dependency array and add `AbortController` cleanup
  - [x] Improve JSON response handling
  - [x] Render `recentInteractions` data
- [x] Fix `CtrlRoom/backend/index.js`
  - [x] Wrap `/api/staff/dashboard` in `try-catch`
  - [x] Return JSON error on failure
- [x] Fix `CtrlRoom/frontend/next.config.ts`
  - [x] Change `module.exports` to `export default`
- [x] Verify fixes

