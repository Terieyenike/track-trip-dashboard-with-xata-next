# Community moderation

The review inbox is at `/admin/reports`. Access requires a signed-in Supabase user and membership in `public.travel_admins`. Signup metadata, client state, and user-editable profiles cannot grant administrator access. Page, API, and database checks enforce membership.

## Assign and revoke access

Apply the [admin migration](../supabase/migrations/202610060004_admin_review.sql) after the earlier migrations. Through trusted database administration, review and customize the [enrollment template](../supabase/assign-first-admin.sql) for the intended confirmed account. Never expose a service-role key or database management credentials to the app.

Revoke access by removing the account's membership from `travel_admins` through trusted database administration. Membership is checked on each request; an existing login session does not retain revoked privileges.

## Review workflow

Open reports are sorted oldest first, 20 per page. Select a report to read its concern, current story content, publication status, and decision history. Reporter account identifiers are omitted from the response. Record a decision note before applying an action:

- **Hide:** remove public access and prevent author republishing, including direct database API writes.
- **Restore:** lift the hold while leaving the story unpublished; its author may publish again.
- **Resolve:** mark the report reviewed without changing the story.

Decisions and audit entries are committed together. Concurrent changes cause a conflict rather than silently overwriting another decision. Audit notes are accessible through admin-checked functions. Ordinary reporters cannot mark their own reports reviewed.

The inbox refreshes every minute while open. Email, webhook, and background notifications are not implemented. Assign a human reviewer and a review schedule.

## Verify

Run [verify-admin-review.sql](../supabase/verify-admin-review.sql) against a configured project. Its temporary fixtures are rolled back. It checks non-admin denial, blocked self-promotion, review guards, hide/restore enforcement, audit entries, and stale decisions. Also verify the UI with separate administrator and ordinary accounts.
