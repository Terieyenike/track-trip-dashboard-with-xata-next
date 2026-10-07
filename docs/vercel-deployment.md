# Vercel deployment

Production: https://tracktrips-app.vercel.app
Project: `teri-eyenikes-projects/track-trips`

Deployed successfully on 2026-10-07 using the official Vercel CLI 62.7.0. Deployment: `dpl_28JyqyDevunfUb4DyABhxz4Lky7n`.

Production environment contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `APP_ORIGIN` set to the production origin. No service-role key is used. Build directories and environment files are excluded from deployment uploads by `.vercelignore`.

Verified production build, homepage and public story listing rendering, and anonymous admin API rejection (401). Full account login and CRUD have not been tested in production.

Pending approval: save the production Site URL and exact Supabase callback allowlist:
- `https://tracktrips-app.vercel.app/auth/callback`
- `https://tracktrips-app.vercel.app/auth/callback?next=/reset-password`

Custom SMTP remains unconfigured. Account confirmation and password reset email delivery still have the built-in Supabase limitations. GitHub repository connection is configured. Pushes to the production branch build and deploy through Vercel; local unsaved or unpushed edits do not go live. `vercel.json` requires lint, tests, and build to pass before a deployment is promoted. Failed deployments preserve the previous live release.

Redeploy from this checkout with `npx --yes vercel@latest --prod --yes`.

Repository renamed to https://github.com/Terieyenike/track-trips on 2026-10-07. The Git remote and production origin were updated. `track-trips.vercel.app` was unavailable; the approved fallback is `tracktrips-app.vercel.app`.
