# Public travel stories

Stories contain selected travel memories and one useful takeaway. They are readable without an account and are separate from the author's private workspace.

## Create and read

- Create or edit a story at `/dashboard/stories/create`, choose a saved trip, select memories, set a public display name, and preview before publishing.
- Browse `/explore` and read `/stories/[id]` without signing in. Discovery searches the latest 60 published stories; larger collections need pagination and server-side search.
- Publishing creates a separate text snapshot. Private photos, account emails, trip dates, budgets, itinerary, packing lists, and unselected journal entries are excluded. The server derives content from the signed-in user's saved workspace.
- Authors can update or unpublish their stories. Unpublishing removes app access but cannot revoke external copies or search-engine caches. A moderation hold prevents republishing until an administrator lifts it.

The current release is text-first. Public photo sharing would require separately opted-in assets and moderation; private storage must remain private.

## Save inspiration and start a trip

Signed-in readers can save story references to `/saved-stories`. Bookmarks belong to their private workspace and display stories that remain published. A bookmark does not preserve a permanent copy of removed content.

A story can seed a private trip with new identifiers, the reader's own dates, suggested activities from public memory titles, and author attribution. Original private itineraries, photos, and bookings are not copied. Readers supply their own prices and practical checks.

## Report and moderate

Readers can report a published story through its report form. Reports are private to the reporter and protected administrator functions. The [community guidelines](https://tracktrips-app.vercel.app/community-guidelines) describe expected content. Administrators review reports at `/admin/reports`; see [moderation instructions](admin-review.md). Review is human-led, with no background notifications or automated moderation.

## Database setup and verification

Apply the versioned migrations in [Supabase setup](supabase-setup.md). Run [verify-stories.sql](../supabase/verify-stories.sql) and [verify-admin-review.sql](../supabase/verify-admin-review.sql); both roll back temporary fixtures. Then test publication, reading, editing, unpublishing, bookmarking, template creation, reporting, and attempted foreign writes using two accounts and an anonymous session. Use deliberately chosen test content with the owner's consent.
