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
- PostgreSQL-backed lead, subscriber, intake, and audit storage
- Protected back office with GitHub OAuth, an administrator email allowlist, attorney-intake workflow statuses, and general lead review
- Private S3-compatible PDF document center with authenticated inline reading, downloads, removal controls, integrity hashes, range delivery, and an access audit trail
- Privacy and terms pages
- Branded Open Graph/X link preview
- Automated build and rendered-route tests

## Local setup

Requirements: Node.js 22.13 or newer and pnpm. PostgreSQL and S3-compatible storage are required for database-backed and document-center features.

```bash
pnpm install
cp .env.example .env.local
pnpm run dev
```

The site runs at `http://localhost:3000`.

## Railway deployment

The app is configured for Railway with `railway.json`. Railway builds the standalone Next.js server, runs `pnpm run db:migrate` before deployment, and checks `/api/health` before accepting the rollout.

1. Create a Railway project with a **PostgreSQL** service and a private **Bucket**.
2. Connect this GitHub repository to a Railway web service. Railway will use the committed `railway.json` automatically.
3. Add the production variables below. Use Railway variable references for PostgreSQL and Bucket credentials; do not paste them into source code.
4. Create a GitHub OAuth App with the callback URL `https://YOUR-DOMAIN/api/admin/oauth/callback`, then add its ID and secret as Railway variables.
5. Deploy first to a staging Railway environment, verify every public form plus the protected admin workflow, and only then attach the business domain.

### Required production variables

- `APP_ORIGIN`: the one canonical HTTPS production origin, for example `https://contornocorporation.com`
- `DATABASE_URL`: Railway PostgreSQL connection string, normally a variable reference to the PostgreSQL service
- `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_ENDPOINT`: private Railway Bucket credentials. The Bucket credentials tab supplies these values. Set `S3_FORCE_PATH_STYLE=false` for current Railway Buckets unless the credentials panel explicitly says otherwise.
- `ADMIN_EMAILS`: comma-separated, verified GitHub email addresses permitted to open `/admin`
- `ADMIN_GITHUB_CLIENT_ID` and `ADMIN_GITHUB_CLIENT_SECRET`: credentials for the organization’s GitHub OAuth App
- `ADMIN_SESSION_SECRET`: a unique random secret of at least 32 characters used to sign HttpOnly administrator sessions
- `OPENAI_API_KEY`: server-side OpenAI project key for the AI concierge
- `OPENAI_MODEL`: optional model override; defaults to `gpt-5.6-luna`
- `RATE_LIMIT_SECRET`: a stable, random 64-character secret used to create rotating abuse-prevention tokens; public forms fail closed when it is absent

Never expose `OPENAI_API_KEY`, database credentials, bucket credentials, OAuth secrets, or session secrets in client-side code or commit a populated environment file. The admin interface fails closed until its OAuth configuration and allowlist are set.

The legacy `drizzle/` directory is retained only as the prior D1/SQLite migration history. New Railway deployments use the PostgreSQL baseline in `scripts/migrate-postgres.mjs`, which intentionally accepts a fresh database only and validates an already-initialized schema before every deployment. If any real data exists in the previous host, perform a separately approved export, row-count/checksum validation, and protected object transfer before cutover.

For staging, use a separate Railway environment and a separate GitHub OAuth App (or an OAuth App whose callback URL is set to that staging domain). The OAuth callback is deliberately tied to `APP_ORIGIN`, so it cannot safely authenticate through an arbitrary preview URL.

## Quality checks

```bash
pnpm run lint
pnpm test
pnpm run db:migrate
```

## Deployment handoff

Production setup still requires the confirmed administrator email address, GitHub OAuth App credentials, production environment values, an owner-approved document retention policy, and the exact professional license numbers supplied by the business owner. Do not publish placeholder license information.
