# Track Trips relaunch brief

Research checked October 5, 2026. This is a product hypothesis based on public feature pages, not proof of customer demand.

## The opportunity

Track Trips previously offered destination records and travel memories. A useful relaunch should also help travelers decide what to do each day, prepare before departure, and keep planned costs visible. Suggested audience: independent travelers organizing short holidays who want a calm planner and personal journal together.

Suggested positioning: **Plan the days. Keep the memories.**

## What competitors do well

| Product | Useful pattern | Track Trips decision |
| --- | --- | --- |
| [Wanderlog](https://wanderlog.com/home) | Daily itineraries, budgets, checklists, map context, and collaboration | Add daily planning, cost estimates, preparation lists, and map shortcuts now. |
| [TripIt](https://help.tripit.com/en/support/solutions/articles/103000063396-tripit-or-tripit-pro-) | Centralizing travel arrangements and storing important travel information | Keep booking links and notes attached to activities. Automated booking import is a later project. |
| [Polarsteps](https://www.polarsteps.com/) | Connecting planning, tracking, and reliving trips | Keep the travel journal alongside the practical planner. Automatic GPS tracking is not included. |

These are strong alternatives already. Track Trips needs a specific audience and easy first-use experience; a larger feature list alone will not establish an advantage.

## Implemented in this build

- Day-by-day activities with dates, optional times, categories, addresses, notes, booking links, and map shortcuts.
- Planned activity costs in one trip currency; trip budget and over-budget visibility. These are user estimates, without exchange-rate conversion or live prices.
- Preparation and packing checklist with optional starter essentials.
- Experience completion, activity editing, removal with undo, and preservation of activities when trip dates change.
- Downloadable plain-text itinerary and JSON trip data export, including related journal entries.
- Updated landing-page copy describing the actual new functionality.

Storage is still browser-local. A data export is a downloadable snapshot, not cloud backup or a restore feature. Downloaded files are private until the traveler chooses to share them.

## Next priorities, in order

1. **Reliable accounts and data:** choose the replacement database, implement server-enforced ownership, cloud photo storage, backups and tested restoration. Make storage limits and recovery behavior clear. Do not accept real customer data under a promise of cloud persistence until this works.
2. **A fast first useful plan:** observe 5–10 target travelers create a real trip. Measure whether they can add three activities, set a budget, and capture a memory without assistance. This is a proposed research exercise, not an existing result.
3. **Travel-together features:** invite-only collaboration and read-only sharing, with explicit permissions and revocable links. Group planning should come after ownership and persistence.
4. **Return during the journey:** calendar export, a mobile-first travel view, and tested offline access. Browser storage by itself does not make the app available offline.
5. **Discovery that earns trust:** curated destination templates and verified recommendations. Consider AI only after the itinerary workflow is useful; label suggestions and avoid invented opening hours, booking availability, or prices.

## Product Hunt draft

**Name:** Track Trips

**Tagline:** Plan your days, track your budget, keep the memories

**Description:** Track Trips brings daily itineraries, estimated budgets, packing lists, and travel memories into one calm workspace. Add activities and booking links, prepare for departure, and download your plan to take with you. This preview saves in your browser; cloud accounts and sync are not available yet.

**Maker comment draft:**

Hi Product Hunt! I built Track Trips to give my travel plans and memories a home. The first version focused on documenting trips. This rebuild adds practical planning: daily activities, estimated costs, budgets, packing lists, and downloadable itineraries. I’d love feedback from independent travelers: what would make this useful before, during, and after your next trip? This build is a browser-local preview, and reliable cloud accounts and storage are the next milestone.

Rewrite the preview disclosure when cloud functionality is implemented and verified. Do not list planned collaboration or AI features as available.

## Relaunch eligibility and assets

Product Hunt generally asks for six months between related launches and a significant new use case; earlier relaunches require review. A visual refresh alone does not satisfy its stated criteria. The previous launch date is unknown, so eligibility has not been established. See [the current relaunch policy](https://help.producthunt.com/en/articles/484934-can-i-relaunch-my-product).

Prepare the real product URL, a concise tagline and description, a square thumbnail, at least two gallery images, and a maker introduction. Product Hunt recommends 240×240 for thumbnails and 1270×760 for gallery images. Verify these requirements again near launch. See [the official preparation guide](https://www.producthunt.com/launch/preparing-for-launch).

Suggested gallery story:

1. “Your trip, day by day” — a real daily itinerary with booking context.
2. “Know your costs. Feel ready.” — budget visibility and a preparation checklist.
3. “Bring the memories home” — travel journal and an itinerary download.

Suggested 45-second demo: create a trip → add two activities → set a budget → complete a packing item → save a memory → download the itinerary.

No Product Hunt post, external message, or deployment has been created.
