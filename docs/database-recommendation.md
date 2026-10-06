# Recommended replacement: Supabase Postgres

For Track Trips, use Supabase for Postgres, authentication, and private photo storage. Trips, journal entries, itinerary activities, packing items, and trip members fit relational tables well. This is a recommendation; no cloud project or migration has been created.

## Migration approach

1. Implement real accounts and user-scoped access policies before cloud writes.
2. Create tables for trips, journal entries, activities, packing items, and trip members; index owner IDs, trip IDs, and activity dates. Store money as integer minor units, with currency per trip.
3. Keep journal photos in a private storage bucket, with scoped access and temporary signed URLs.
4. Offer an explicit import of existing browser-local trips after sign-in. Preserve the local originals until the import has been verified. Do not silently upload the seeded demo records.
5. Use versioned SQL migrations, independent database dumps, and separately backed-up photo objects. Supabase database backups do not include stored photo objects. Test restoration before launch.
6. Retire the unused Xata client only after the new adapter and ownership checks are verified. If Xata data is unavailable, recovery needs a previous export or backup; changing providers cannot recover deleted records.

## Alternative

Neon is also a viable Postgres choice, especially if you prefer its platform or already have separate account and storage systems. For this app, Supabase offers a straightforward integrated path. Recheck current plan limits, regions, and backup retention when provisioning; no pricing assumptions are baked into this recommendation.

Sources checked October 6, 2026:
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage
- https://supabase.com/docs/guides/platform/backups
- https://neon.com/blog/neon-backend-is-ga
