---
description: "Rework global CSS and UI polish across the app while preserving existing structure and color direction"
name: "Global CSS Rework"
argument-hint: "Target pages/components, constraints, and priority areas"
agent: "agent"
---
Perform a professional, app-wide UI and CSS cleanup for this Next.js workspace.

Primary goal:
- Improve visual quality and consistency across the entire app, with special emphasis on the sidebar.

Hard constraints:
- Keep the current information architecture and page/component organization.
- Keep the current color direction and branding feel.
- Keep the sidebar icon and title exactly the same.
- Do not introduce sweeping structural rewrites unless required for styling consistency.

Execution instructions:
1. Audit the current design tokens and shared styles first (`app/globals.css`, Tailwind config, shared UI components).
2. Implement a coherent style system with reusable CSS variables/utilities where helpful.
3. Improve spacing, typography hierarchy, surfaces, borders, shadows, and states (hover/focus/active/disabled) for a professional look.
4. Redesign the sidebar visuals to look polished and intentional while preserving its content, icon, and title.
5. Apply improvements consistently across main app surfaces (layout shell, cards, tables, forms, buttons, nav, empty states, and loading states).
6. Ensure responsive behavior remains strong on desktop and mobile.
7. Preserve accessibility basics: color contrast, visible focus states, and semantic interaction cues.

Output format:
- Start with a short design direction summary.
- Then list concrete file edits grouped by file.
- Include before/after rationale for major UI decisions.
- End with a validation checklist covering visual consistency, responsiveness, and accessibility.

If inputs are missing, ask concise clarifying questions before editing.
