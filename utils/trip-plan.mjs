export const currencies = [
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
];
export const activityTypes = ["Explore", "Food", "Stay", "Transport", "Other"];
export const emptyPlan = () => ({
  currency: "USD",
  budget: 0,
  activities: [],
  packing: [],
});
const validId = (id) =>
  typeof id === "string" && /^[a-zA-Z0-9_-]{1,150}$/.test(id);
const text = (value, max) => typeof value === "string" && value.length <= max;
const validDate = (date) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date || "") &&
  Number.isFinite(Date.parse(`${date}T12:00:00Z`)) &&
  new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
export function safeLink(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function toCents(value) {
  if (value === "") return 0;
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(String(value)))
    throw new Error(
      "Enter an amount from 0 to 9,999,999.99 with up to two decimal places.",
    );
  return Math.round(Number(value) * 100);
}
export function validatePlan(plan) {
  if (
    !plan ||
    !currencies.includes(plan.currency) ||
    !Number.isSafeInteger(plan.budget) ||
    plan.budget < 0 ||
    plan.budget > 999999999 ||
    !Array.isArray(plan.activities) ||
    !Array.isArray(plan.packing) ||
    plan.activities.length > 1000 ||
    plan.packing.length > 500
  )
    throw new Error("Invalid saved trip plan");
  for (const activity of plan.activities) {
    if (
      !activity ||
      !validId(activity.id) ||
      !text(activity.title, 150) ||
      !activity.title.trim() ||
      !validDate(activity.date) ||
      !text(activity.time, 5) ||
      (activity.time !== "" &&
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(activity.time)) ||
      !activityTypes.includes(activity.type) ||
      !text(activity.place, 200) ||
      !text(activity.notes, 2000) ||
      !text(activity.link, 2000) ||
      !safeLink(activity.link) ||
      !Number.isSafeInteger(activity.cost) ||
      activity.cost < 0 ||
      activity.cost > 999999999 ||
      (activity.actualCost !== undefined && activity.actualCost !== null && (!Number.isSafeInteger(activity.actualCost) || activity.actualCost < 0 || activity.actualCost > 999999999)) ||
      typeof activity.done !== "boolean"
    )
      throw new Error("Invalid saved itinerary activity");
  }
  for (const item of plan.packing)
    if (
      !item ||
      !validId(item.id) ||
      !text(item.title, 150) ||
      !item.title.trim() ||
      typeof item.done !== "boolean"
    )
      throw new Error("Invalid saved packing item");
  for (const collection of [plan.activities, plan.packing])
    if (new Set(collection.map((item) => item.id)).size !== collection.length)
      throw new Error("Duplicate plan item");
  return plan;
}
export function updateTripPlan(data, id, update) {
  const trip = data.trips.find((trip) => trip.id === id);
  if (!trip)
    throw new Error("This trip no longer exists. Return to your workspace.");
  const plan = validatePlan(update(trip.plan || emptyPlan(), trip));
  return {
    ...data,
    trips: data.trips.map((item) =>
      item.id === id ? { ...item, plan } : item,
    ),
  };
}
export function saveActivity(plan, activity, trip, editing = false) {
  if (activity.date < trip.start || activity.date > trip.end)
    throw new Error("Choose a day within this trip’s dates.");
  if (editing && !plan.activities.some((item) => item.id === activity.id))
    throw new Error(
      "This activity was removed. Close the editor and try again.",
    );
  return {
    ...plan,
    activities: editing
      ? plan.activities.map((item) =>
          item.id === activity.id ? activity : item,
        )
      : [...plan.activities, activity],
  };
}
export function shiftDate(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function tripLength(trip) {
  return (
    Math.round(
      (Date.parse(trip.end + "T12:00:00Z") -
        Date.parse(trip.start + "T12:00:00Z")) /
        86400000,
    ) + 1
  );
}
export function getBudget(plan) {
  const planned = plan.activities.reduce((total, item) => total + item.cost, 0);
  return {
    planned,
    actual: plan.activities.reduce((total, item) => total + (item.actualCost || 0), 0),
    recorded: plan.activities.filter(item => item.actualCost !== undefined && item.actualCost !== null).length,
    remaining: plan.budget - planned,
    over: plan.budget > 0 && planned > plan.budget,
  };
}
export function sortedActivities(activities) {
  return [...activities].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time || "99:99").localeCompare(b.time || "99:99"),
  );
}
export function itineraryText(trip) {
  const plan = trip.plan || emptyPlan();
  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: plan.currency,
    }).format(value / 100);
  const lines = [
    `${trip.title}`,
    `${trip.city}, ${trip.country}`,
    `${trip.start} → ${trip.end}`,
    "",
    trip.description || "",
    "",
    `Budget: ${plan.budget ? money(plan.budget) : "Not set"}`,
    `Planned activity costs: ${money(getBudget(plan).planned)}`,
    `Recorded actual spending: ${money(getBudget(plan).actual)} (${getBudget(plan).recorded} activities recorded)`,
    "",
    "DAY-BY-DAY ITINERARY",
  ];
  let currentDate = "";
  for (const item of sortedActivities(plan.activities)) {
    if (item.date !== currentDate) {
      lines.push("", item.date);
      currentDate = item.date;
    }
    lines.push(
      `${item.done ? "[x]" : "[ ]"} ${item.time || "Any time"} · ${item.title} · ${item.type}${item.place ? " · " + item.place : ""} · ${money(item.cost)}`,
    );
    if (item.notes) lines.push("  " + item.notes);
    if (item.link) lines.push("  " + item.link);
  }
  if (!plan.activities.length) lines.push("No activities added yet.");
  lines.push("", "PACKING & PREPARATION");
  for (const item of plan.packing)
    lines.push(`${item.done ? "[x]" : "[ ]"} ${item.title}`);
  lines.push(
    "",
    "Created with Track Trips. Costs are entered estimates, not live prices.",
  );
  return lines.join("\n");
}
