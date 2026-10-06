# Public travel stories

The product direction is practical travel storytelling: selected memories plus one useful takeaway, readable without an account. This complements the private trip planner rather than exposing a user's workspace.

## Included

- `/explore`: destination/category search across the latest 60 published stories.
- `/stories/[id]`: account-free reading with a planning CTA.
- Trip detail: display name, useful takeaway, selected memories, public preview, explicit publish confirmation, updates, and unpublishing.
- Separate JSON snapshot storage. No automatic publication and no private photo URLs, email addresses, trip dates, budget, packing, itinerary, or trip description in the snapshot.
- Server derives content from the verified user's saved workspace; other users' memories cannot be selected through the endpoint.
- Journal categories support suggestions and custom names up to 40 characters, including previous categories from the same account.
- Budget starts blank with a `0.00` placeholder and selects an existing value on focus. Currency remains a label, not an exchange-rate conversion.

## Activation

The public-story migration `supabase/migrations/202610060002_public_stories.sql` was applied with user approval on 2026-10-06. The private report queue migration `202610060003_story_reports.sql` was also applied. Published content is intentionally readable without authentication; unpublished snapshots remain accessible only to their owner.

Test with two signed-in accounts and an anonymous session: publication, reading, updating, unpublishing, and attempted foreign writes. Do not publish existing personal memories as test fixtures without the owner's consent. Unpublishing cannot revoke external copies or search-engine caches.

## Before a public launch

Custom authentication SMTP remains deferred by the user. Reporting and community guidelines are included. Assign a human reviewer and a review cadence before inviting public submissions at scale. Current discovery is limited to the latest 60 records, so pagination and server-side search are needed as the collection grows. This release is text-first; public photos require separate opt-in copies and moderation rather than opening private storage.

Reusable templates with author credit, estimated versus actual spending, and account bookmarks are included; see the follow-up details below.

## Follow-ups implemented

Saved stories now persist as a bounded list of story identifiers inside the user's private cloud workspace. `/saved-stories` displays only stories that remain published. Readers can create a private trip from selected public memory titles, with new IDs, their own dates, and author attribution. No original private itinerary, photos, or bookings are copied.

Activities have an optional actual amount paid. Blank means unrecorded; zero means explicitly free. Budget summaries show estimates separately from recorded spending and report how many activities have actual amounts.

Reports use `travel_story_reports`, isolated to the reporter and database administrators. `/community-guidelines` describes expected content and the review process. Review is manual in Supabase: there is no automated moderation or reviewer notification service.

### Administrator review workflow

In the Supabase Table Editor, inspect `travel_story_reports` where `reviewed_at` is null. Review the corresponding `travel_stories` snapshot. If removal is warranted, set that story's `published` field to false, then mark the report's `reviewed_at`. Leave unpublished snapshots available only to their author. Avoid exporting reporter identities or publishing report details. Assign a human to review this queue before a public launch.

Live verification SQL: `supabase/verify-stories.sql` tests public opt-in, draft privacy, foreign edits, unpublishing, and report privacy. It rolls back its fixtures.
