import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyPlan,
  getBudget,
  itineraryText,
  saveActivity,
  shiftDate,
  sortedActivities,
  toCents,
  tripLength,
  updateTripPlan,
  validatePlan,
} from "../utils/trip-plan.mjs";
import {
  initial,
  parseTravelData,
  upsertRecord,
} from "../utils/travel-data.mjs";
const trip = initial.trips[1];
const activity = {
  id: "first-stop",
  title: "Mountain walk",
  date: trip.start,
  time: "09:00",
  type: "Explore",
  place: "Grindelwald",
  notes: "Bring a jacket.",
  link: "https://example.com",
  cost: 1250,
  done: false,
};
test("old saved trips remain readable without a plan", () =>
  assert.deepEqual(parseTravelData(JSON.stringify(initial)), initial));
test("plans survive storage serialization and unrelated trip edits", () => {
  const next = updateTripPlan(initial, trip.id, (plan) =>
    saveActivity(plan, activity, trip),
  );
  assert.equal(next.trips[1].plan.activities.length, 1);
  assert.equal(initial.trips[1].plan, undefined);
  assert.deepEqual(parseTravelData(JSON.stringify(next)), next);
  const edited = upsertRecord(
    next,
    "trips",
    { ...next.trips[1], title: "Updated title" },
    true,
  );
  assert.equal(edited.trips[1].plan.activities[0].id, activity.id);
});
test("money uses integer cents and budget warnings include all activities", () => {
  assert.equal(toCents("12.35"), 1235);
  assert.equal(toCents("0.29"), 29);
  assert.equal(toCents(""), 0);
  for (const amount of ["-1", "12.345", "Infinity", "1e3"])
    assert.throws(() => toCents(amount));
  assert.deepEqual(
    getBudget({ ...emptyPlan(), budget: 1000, activities: [activity] }),
    { planned: 1250, actual: 0, recorded: 0, remaining: -250, over: true },
  );
});
test("rejects unsafe links, bad costs, dates, and duplicate rows", () => {
  for (const change of [
    { link: "javascript:alert(1)" },
    { time: "25:00" },
    { date: "2027-02-30" },
    { cost: -1 },
  ])
    assert.throws(() =>
      validatePlan({
        ...emptyPlan(),
        activities: [{ ...activity, ...change }],
      }),
    );
  assert.throws(() =>
    validatePlan({ ...emptyPlan(), activities: [activity, activity] }),
  );
  assert.throws(
    () => saveActivity(emptyPlan(), { ...activity, date: "2028-01-01" }, trip),
    /within/,
  );
  assert.throws(
    () => saveActivity(emptyPlan(), activity, trip, true),
    /removed/,
  );
});
test("changing trip dates preserves existing activities for rescheduling", () => {
  const next = updateTripPlan(initial, trip.id, (plan) =>
    saveActivity(plan, activity, trip),
  );
  const changed = upsertRecord(
    next,
    "trips",
    { ...next.trips[1], start: "2027-02-01", end: "2027-02-03" },
    true,
  );
  assert.equal(
    parseTravelData(JSON.stringify(changed)).trips[1].plan.activities[0].date,
    trip.start,
  );
});
test("sorts activities by date and time, exports costs and checklist state", () => {
  const late = { ...activity, id: "later", time: "15:00" };
  assert.deepEqual(
    sortedActivities([late, activity]).map((row) => row.id),
    ["first-stop", "later"],
  );
  const plan = {
    ...emptyPlan(),
    budget: 10000,
    activities: [activity],
    packing: [{ id: "jacket", title: "Warm jacket", done: true }],
  };
  const output = itineraryText({ ...trip, plan });
  assert.match(output, /09:00 · Mountain walk/);
  assert.match(output, /\$12\.50/);
  assert.match(output, /\[x\] Warm jacket/);
  assert.match(output, /not live prices/);
  assert.equal(shiftDate("2026-12-31", 1), "2027-01-01");
  assert.equal(tripLength({ start: "2026-12-31", end: "2027-01-02" }), 3);
});
test('actual spending distinguishes unrecorded and zero and survives serialization',()=>{
 const plan={...emptyPlan(),activities:[{...activity,id:'one',actualCost:null},{...activity,id:'two',actualCost:0},{...activity,id:'three',actualCost:1550}]};
 validatePlan(plan);assert.equal(getBudget(plan).actual,1550);assert.equal(getBudget(plan).recorded,2);
 assert.equal(getBudget(JSON.parse(JSON.stringify(plan))).actual,1550);
 assert.throws(()=>validatePlan({...plan,activities:[{...activity,actualCost:-1}]}));
});
