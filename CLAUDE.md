# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js 15 (App Router, React 19, TypeScript strict) · PostgreSQL via Prisma · NextAuth v5 · Tailwind v4 + shadcn/ui (new-york) · Vitest.

Package manager: local dev uses **bun** (`bun install` / `bun run ...`). But the committed lockfile is **`package-lock.json`** and the Docker image builds with `npm ci` (the Dockerfile has no bun branch). So when changing dependencies, keep `package-lock.json` in sync (run `npm install <pkg>` once, or it won't reach the image) and commit it.

## Commands

- `npm run dev` — dev server (uses `--turbopack`)
- `npm run test` — run tests once (Vitest); `npm run test:watch` for watch mode
- `npm run format` — Prettier write across the repo
- `npm run build` — production build. **Run this before considering a change done — it's the type-check** (no separate `tsc` script).

Lint + format run automatically on commit via husky/lint-staged; no need to run them manually.

## Conventions

- Import alias: `@/*` → `./src/*`.
- ESLint intentionally disables `@typescript-eslint/no-explicit-any` and `react-hooks/exhaustive-deps` — don't "fix" code to satisfy these.
- Commits: gitmoji + conventional prefix, e.g. `feat: :sparkles: ...`, `fix: :bug: ...`. Branch from and PR into **`dev`**, not `main`.

## Gotchas

- `next.config.ts` aliases `micromark-extension-math` → `micromark-extension-llm-math` for math rendering — keep this when touching webpack/markdown config.
- After editing `prisma/schema.prisma`, run `npx prisma generate`.
- Requires env vars: `DATABASE_URL`, `AUTH_SECRET`/`AUTH_URL`/`AUTH_TRUST_HOST`, the `AUTH_CLIENT_*` and `AUTH_AUTHENTIK_*` OAuth sets, and `DEEPSEEK_API_KEY`/`OPENAI_API_KEY`/`OPENAI_API_BASE_URL` for the AI features.
- Production build uses `output: "standalone"` (Docker); `/submit`, `/examine`, `/translate`, `/admin/admin-browse` redirect to their `/1` paginated variants.
