import test from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  parseTravelData,
  validateFields,
  upsertRecord,
  deleteRecord,
  isDate,
} from "../utils/travel-data.mjs";

test("saved workspace survives serialization with related memories", () => {
  assert.deepEqual(parseTravelData(JSON.stringify(initial)), initial);
  assert.equal(parseTravelData(null), initial);
});
test("rejects malformed records instead of letting cards crash", () => {
  for (const value of [
    "{",
    "{}",
    JSON.stringify({ ...initial, trips: [null] }),
    JSON.stringify({
      ...initial,
      notes: [{ ...initial.notes[0], rating: "-1" }],
    }),
    JSON.stringify({
      ...initial,
      trips: [{ ...initial.trips[0], status: null }],
    }),
    JSON.stringify({ ...initial, trips: [...initial.trips, initial.trips[0]] }),
  ])
    assert.throws(() => parseTravelData(value));
});
test("date validation rejects impossible calendar dates and permits same-day trips", () => {
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(isDate("2028-02-29"), true);
  assert.match(
    validateFields({ ...initial.trips[0], end: "2026-11-01" }, false, []),
    /end date/,
  );
  assert.equal(
    validateFields(
      { ...initial.trips[0], end: initial.trips[0].start },
      false,
      [],
    ),
    "",
  );
});
test("rejects whitespace-only required fields and orphaned notes", () => {
  assert.match(
    validateFields({ ...initial.trips[0], title: "   " }, false, []),
    /required/,
  );
  assert.throws(
    () =>
      upsertRecord({ ...initial, trips: [] }, "notes", initial.notes[0], false),
    /existing trip/,
  );
});
test("editing and deletion preserve other trips and their memories", () => {
  const edited = upsertRecord(
    initial,
    "trips",
    { ...initial.trips[0], title: "A revised itinerary" },
    true,
  );
  assert.equal(edited.trips.length, initial.trips.length);
  assert.equal(edited.trips[0].title, "A revised itinerary");
  assert.equal(initial.trips[0].title, "Chasing the golden hour");
  const removed = deleteRecord(initial, "trips", "lagos");
  assert.equal(removed.trips.length, 2);
  assert.equal(removed.notes.length, 0);
  assert.equal(initial.notes.length, 1);
  assert.throws(
    () => upsertRecord(removed, "trips", initial.trips[2], true),
    /removed in another tab/,
  );
});
test("rejects unsafe image sources and invalid memory ratings", () => {
  assert.throws(() =>
    parseTravelData(
      JSON.stringify({
        ...initial,
        trips: [
          { ...initial.trips[0], image: "https://untrusted.example/photo.png" },
        ],
      }),
    ),
  );
  for (const rating of ["0", "6", "2.5", "invalid"])
    assert.match(
      validateFields({ ...initial.notes[0], rating }, true, initial.trips),
      /rating/,
    );
});
