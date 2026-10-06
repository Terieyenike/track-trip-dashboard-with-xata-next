# Supabase connection status

Project: `xpedkbevnloobfejxrsl`

- Project URL and publishable key are configured in ignored `.env.local`.
- Public authentication settings respond successfully. Email/password accounts and sign-up are enabled; email confirmation is enabled.
- The app recognizes the connection and displays enabled sign-in fields. An invalid sign-in is rejected.
- The local request-origin mismatch is fixed using the canonical `APP_ORIGIN`; cross-site requests remain rejected. The regression suite now has 20 passing tests.
- The atomic application migration was applied successfully in the project's Supabase SQL editor on 2026-10-06. Workspace tables, private photo storage, ownership policies, revision checks, and request-limit functions are installed.
- The publishable key cannot create tables, policies, buckets, or admin users.
- The SQL isolation test passed against the live database: owner isolation, blocked foreign writes, stale revisions, upload limits, and anonymous access. Temporary test users and records were rolled back.
- Real-account browser CRUD and private photo upload/download are still pending. SQL role checks do not replace end-to-end verification of login, email confirmation, cookies, or storage downloads.

The migration is atomic and the SQL isolation test rolls back temporary records. See [setup](supabase-setup.md) for both files, callback URLs, email configuration, and deployment checks.

Public stories and private report queue migrations were applied on 2026-10-06. Live rollback-only SQL tests passed for public opt-in, draft privacy, blocked foreign writes, unpublishing, and report privacy. Unit tests cover template identity/date remapping, private-field exclusion, bookmarks, and recorded actual spending (27 tests total). Browser checks covered the saved-story empty state and actual spending controls. Real-account publication, bookmarking, template creation, and report submission still need full end-to-end verification with deliberately chosen test content.
