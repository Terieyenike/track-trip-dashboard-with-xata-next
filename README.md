# Track Trips

A travel planning and journaling app with Supabase account support. Project connection and live account-isolation verification are still required.

## Run

```sh
npm install
cp .env.example .env.local
# Set the Supabase project URL and publishable key in .env.local.
npm run dev
```

See [Supabase setup](docs/supabase-setup.md) for the migration, authentication URLs, email templates, and two-account tests. Never use a service-role key in this app. Without configuration, sign-in explains that account setup is pending; dashboard routes remain protected.

`npm run build`, `npm run lint`, and `npm test` verify the build, code, and data/security helpers. `.next-dev` and `.next` keep development and production artifacts separate.

## Features

Responsive travel homepage, inherited compass favicons, authenticated workspace, email/password sign-in and sign-up, confirmation and password reset, sign-out, trip and journal CRUD, private photos, daily plans, budget estimates, packing checklists, and itinerary/JSON exports.

## Data and security

Accounts start with an empty workspace. User identity is verified on the server, the database has row-level ownership policies, and private photo routes enforce the same ownership. Browser JavaScript receives no authentication tokens; session cookies are HttpOnly and Secure in production. Mutations check request origin. Failed cloud saves are shown, and conflicting device edits are rejected using a database revision check.

Existing `track-trips-preview-v1` browser-local records are preserved. Import is optional, copies records into the signed-in account, and retains the originals. No unavailable Xata data is recovered by this migration. Legacy Xata source files remain unused by active routes.

Initial cloud workspaces use bounded JSONB per account (500 trips, 2,000 memories, 8 MB), with photos in separate private storage. Move to per-record tables before large workspaces, collaboration, or analytics. Monetary values use integer minor units; changing currency relabels amounts without conversion. Exports are not a verified restore or sharing flow.

Before public launch, verify the actual project, email delivery, two-account access isolation, backup restoration (including photos), abuse controls, and HTTPS deployment. See the [relaunch brief](docs/product-hunt-relaunch.md) and [setup details](docs/supabase-setup.md).
