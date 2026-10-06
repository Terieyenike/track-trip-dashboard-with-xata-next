# Protected community review

Route: `/admin/reports`. Access requires a verified Supabase account and membership in `public.travel_admins`. Membership is managed only through trusted Supabase database administration. Signup metadata, email matching in the application, client state, and user-editable profiles cannot grant admin access.

Activated on 2026-10-06: `supabase/migrations/202610060004_admin_review.sql` and `supabase/assign-first-admin.sql` were applied atomically after user approval, initially assigning administrator access to `teyenike1@gmail.com`; the user subsequently switched access to `teyenike@duck.com` and Gmail membership was revoked. Future administrator grants require explicit approval. Never expose service-role keys or management credentials to the app.

## Workflow

Open reports are sorted oldest first, 20 per page. Select a report to read the concern, complete public-story snapshot, publication status, and decision history. Reporter account identifiers are omitted from the inbox response. Add a decision note before applying an action:

- Hide: remove public access and prevent author republishing, including direct database API writes.
- Restore: lift the hold while leaving the story unpublished; the author chooses whether to publish again.
- Resolve: mark the report reviewed without changing the story.

Decisions and audit records are committed in one transaction. If the report or moderation hold changes during review, refresh and reconsider rather than overwrite a concurrent decision. Audit notes are accessible only through admin-checked functions. Ordinary reporters cannot mark their own report reviewed.

The inbox refreshes every minute while open. No email, desktop notification, webhook delivery, or background alert is configured. Email-provider setup remains deferred. Assign a human reviewer and review schedule before relying on prompt intervention.

## Revocation

Remove the intended user's membership from `travel_admins` through trusted database management. Server/API/database checks consult membership on each request; existing login sessions do not retain admin privileges after revocation.

## Verification

`supabase/verify-admin-review.sql` passed against the live database on 2026-10-06. It uses rollback-only fixtures and checks membership isolation, non-admin RPC denial, public hiding, blocked owner republishing, forged review timestamps, restore behavior, audit entries, and stale decisions.

Browser verification confirmed the Duck account can open the protected inbox after the administrator switch.
