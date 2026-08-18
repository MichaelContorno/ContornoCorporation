# The Contorno Corporation Website

Production-oriented website for The Contorno Corporation and its three service lines:

- Contorno Criminal Defense Strategies & Investigations
- Ratchet Bail Bonds (coming soon)
- Contorno Community Association Management

The homepage uses the approved PDF artwork as its exact visual source, with accessible interactive controls layered over the original design. Service pages carry the same navy, metallic-gold, silver, and electric-blue brand system.

## Included

- Responsive homepage and detailed service pages
- Conventional site navigation with About Us and Questions & Answers pages
- Confidential lead intake with validation and rate limiting
- Dedicated defense-attorney intake with conflict-screening fields, structured scope and timing, reference codes, validation, and rate limiting
- Verified update-list requests with one-time confirmation links and unsubscribe controls
- AI concierge with a safe non-AI fallback when no API key is configured
- D1-backed lead and subscriber storage
- Protected back office with ChatGPT sign-in, an administrator allowlist, attorney-intake workflow statuses, and general lead review
- Private PDF document center with R2 storage, D1 metadata, authenticated inline reading, downloads, removal controls, integrity hashes, range delivery, and an access audit trail
- Privacy and terms pages
- Branded Open Graph/X link preview
- Automated build and rendered-route tests

## Local setup

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm run dev
```

The site runs at `http://localhost:3000`.

## Required production settings

- `ADMIN_EMAILS`: comma-separated email addresses permitted to open `/admin`
- `OPENAI_API_KEY`: server-side OpenAI project key for the AI concierge
- `OPENAI_MODEL`: optional model override; defaults to `gpt-5.6-luna`
- `RATE_LIMIT_SECRET`: a stable, random 64-character secret used to create rotating abuse-prevention tokens; public forms fail closed when it is absent
- D1 binding named `DB`
- Private R2 binding named `DOCUMENTS`

Never expose `OPENAI_API_KEY` in client-side code or commit a populated environment file.
Replace the sample `RATE_LIMIT_SECRET` before starting locally. Deployments must apply every migration in `drizzle/` before activating the new worker; the application verifies the required schema version before serving database-backed routes.

## Quality checks

```bash
pnpm run lint
pnpm test
pnpm run db:generate
```

## Deployment handoff

Production setup still requires the confirmed administrator email address, production environment values, an owner-approved document retention policy, and the exact professional license numbers supplied by the business owner. Do not publish placeholder license information.
