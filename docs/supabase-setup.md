# Connect Track Trips to Supabase

Track Trips uses Supabase for authentication, private workspaces, photos, public stories, and moderation. These instructions configure your own instance. Verification SQL checks ownership policies; also test account flows and email delivery end to end before public use.

1. Log in at https://supabase.com/dashboard and create or choose a project for Track Trips. Select the intended region and review its plan and backup retention.
2. From the project Connect dialog, put its URL and **publishable** API key into `.env.local`, using `.env.example`. Set `APP_ORIGIN` to the canonical public HTTPS origin before deployment; locally it is `http://127.0.0.1:3000`. Open the app using that configured URL. The app does not use a service-role key. Do not paste database passwords or service-role secrets into chat.
3. Review and apply the SQL files in [supabase/migrations](../supabase/migrations) in filename order to a fresh project: private workspaces and photo storage, public stories, story reports, then protected admin review. Each migration is transactional. Do not rerun already-applied migrations; use the migration history for an existing instance.
4. Configure Authentication URL settings: site URL is your production HTTPS origin; add `http://127.0.0.1:3000/auth/callback` and `http://127.0.0.1:3000/auth/callback?next=/reset-password` for local tests, and matching production callback URLs. Add the production `/auth/confirm` URL when using the templates below. Avoid broad redirect wildcards in production.
5. Keep email confirmation enabled. Set a minimum 12-character password, enable leaked-password protection if supported by your plan, and configure your own SMTP sender before public launch. Supabase's built-in test sender is not a production email service. Configure auth rate limits and CAPTCHA for public launch; this UI does not yet include a CAPTCHA provider widget.
6. For confirmation links that also work across devices, use this confirmation email link: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`. Use `type=recovery` in the reset-password template. The callback route also supports same-browser PKCE redirects.
7. Restart the dev server after setting environment variables. In deployment, set the project URL, publishable key, and `APP_ORIGIN` and redeploy; session cookies are Secure in production, so HTTPS is required.
8. Run `supabase/verify-isolation.sql` to verify row ownership, rejected foreign writes, anonymous access, and stale revisions. It rolls back its temporary records. Then use two test accounts to check sign-in, confirmation, refresh, CRUD, private photos, sign-out, and password reset. Test account A cannot read B's records or photo route even with B's IDs. Confirm no personal responses are cached or stored in browser-local storage.

## Implemented boundaries

- Supabase verifies the current user server-side. Dashboard layout, proxy, each workspace endpoint, and private photo endpoint all enforce authentication.
- Authentication tokens are in HttpOnly, SameSite=Lax cookies. The client does not receive auth tokens or passwords in responses; production cookies use Secure.
- State-changing endpoints reject foreign or missing Origin headers. Passwords are handled by Supabase Auth, not saved in app tables.
- The app’s authenticated workspace API permits 120 writes per minute, and its photo API permits 20 uploads per hour per account using shared database counters. These limits cover the app endpoints; provider-level abuse controls and billing limits still need configuration. Supabase Auth handles its own auth limits. These controls do not replace deployment-level DDoS protection or storage/billing monitoring.
- Database row-level security checks `auth.uid() = owner_id`. Ordinary workspace access enforces these policies. Moderation functions use tightly scoped database privileges after checking administrator membership. New accounts start empty, with no sample trips.
- Photos are stored in a private bucket with account-specific paths. Authenticated image routes return private/no-store responses and bypass public image optimization.
- Workspace writes use a transactional revision check. Another-device edits cause a visible conflict rather than silently replacing saved data. The client refreshes on focus and visibility changes; this is not realtime collaboration.
- Existing `track-trips-preview-v1` local data remains untouched. Import is optional and asks the user to confirm account ownership. Imports copy records with fresh IDs and upload photo data to private storage; the local originals remain. Repeated imports may duplicate records.
- The initial cloud schema stores each user's validated workspace as JSONB, capped at 8 MB, 500 trips, and 2,000 memories; photos are stored separately. This keeps current planner updates atomic. Before large workspaces, collaboration, or analytics, migrate to separate relational trip/activity/note tables with per-record pagination.
- Removed photos may remain as private orphaned objects; schedule authenticated retention/cleanup only after a recovery policy is chosen.

## Launch checks still required

For each deployment, verify email delivery, redirect settings, two-account isolation, backup restoration (including separate photo backups), abuse controls, and HTTPS deployment. Audit dependencies against current advisories rather than relying on a past audit result. SQL fixtures and a successful build do not replace end-to-end account and recovery checks.

Sources: https://supabase.com/docs/guides/auth/server-side/creating-a-client and https://supabase.com/docs/guides/database/postgres/row-level-security
