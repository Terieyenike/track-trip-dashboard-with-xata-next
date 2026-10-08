# Deploy to Vercel

Live app: https://tracktrips-app.vercel.app
Repository: https://github.com/Terieyenike/track-trips

## Configuration

Import the repository into Vercel as a Next.js project with Node.js 22 and the repository root as its root directory. Connect `main` as the production branch. Set these production variables:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key |
| `APP_ORIGIN` | The canonical public HTTPS origin |

No service-role key is required. Keep credentials in Vercel environment settings rather than committed files. `.vercelignore` excludes environment files, build output, dependencies, and private local notes.

Configure Supabase's Site URL to match `APP_ORIGIN` and allow the exact confirmation/recovery callbacks described in [Supabase setup](supabase-setup.md). Configure a verified SMTP sender and test account emails before inviting public signups. HTTPS is required for production session cookies.

## Automatic releases

Commit and push to `main` to trigger a production deployment. Local unpushed edits do not affect the live app. The [Vercel configuration](../vercel.json) runs lint, tests, and the production build in sequence; failures prevent promotion and retain the previous live release. Check the commit's Vercel status and deployment logs after pushing.

For a manual release, authenticate with Vercel, link the checkout to the intended project, then run:

```sh
npx --yes vercel@latest --prod --yes
```

After changing environment variables, redeploy. Keep the canonical domain, `APP_ORIGIN`, Supabase callback settings, and repository website link aligned when changing domains.

## Verify a release

Check public pages and favicons, sign-in and password recovery, authenticated trip/journal saves, private-photo access, and admin denial for ordinary accounts. Verify the canonical origin accepts app mutations and rejects foreign origins. Use separate accounts for ownership checks. Deployment success alone does not establish that all account flows work.
