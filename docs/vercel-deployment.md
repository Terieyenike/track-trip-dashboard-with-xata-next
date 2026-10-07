# Vercel deployment

Production: https://track-trip-dashboard-with-xata-next-alpha.vercel.app
Project: `teri-eyenikes-projects/track-trip-dashboard-with-xata-next`

Deployed successfully on 2026-10-07 using the official Vercel CLI 62.7.0. Deployment: `dpl_28JyqyDevunfUb4DyABhxz4Lky7n`.

Production environment contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `APP_ORIGIN` set to the production origin. No service-role key is used. Build directories and environment files are excluded from deployment uploads by `.vercelignore`.

Verified production build, homepage and public story listing rendering, and anonymous admin API rejection (401). Full account login and CRUD have not been tested in production.

Pending approval: save the production Site URL and exact Supabase callback allowlist:
- `https://track-trip-dashboard-with-xata-next-alpha.vercel.app/auth/callback`
- `https://track-trip-dashboard-with-xata-next-alpha.vercel.app/auth/callback?next=/reset-password`

Custom SMTP remains unconfigured. Account confirmation and password reset email delivery still have the built-in Supabase limitations. GitHub repository connection is configured. Pushes to the production branch build and deploy through Vercel; local unsaved or unpushed edits do not go live. `vercel.json` requires lint, tests, and build to pass before a deployment is promoted. Failed deployments preserve the previous live release.

Redeploy from this checkout with `npx --yes vercel@latest --prod --yes`.
