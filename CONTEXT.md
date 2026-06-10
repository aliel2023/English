# CONTEXT — Alielenglish

## URL
https://aliel2023.github.io/English/

## Stack
Vanilla HTML / CSS / JS — Supabase (Auth + PostgreSQL) — GitHub Pages

## Backend
Supabase (project ref: `wuzwvqgmrcqsiegbtrzs`)

## Auth
Supabase Auth — email/password + Google OAuth

## Database
Supabase PostgreSQL with Row Level Security (RLS) policies
Tables: `users`, `leads`, `ai_usage`, `reports`

## AI
Gemini API (key configured in `js/config.js`)

## JS Entry Points
| File | Role |
|---|---|
| `js/config.js` | Supabase client init + Gemini API key |
| `scripts/auth.js` | Auth system (login, register, session, brute-force protection) |
| `scripts/main.js` | Global utilities & navigation |
| `scripts/motion.js` | 3D tilt & hover animations |

## CSS
`styles/` folder — 22 files (design-system, per-page, responsive, animations)

## Deploy
GitHub Pages via `.github/workflows/static.yml` (push to `main` → auto-deploy)

## UI Cards (hover lift)
`.pricing-card`, `.resource-card`, `.level-card`, `.feature-card`

## 3D Tilt
`scripts/motion.js`

## Supabase Schema
`supabase/schema.sql`
