import { validatePlan } from "./trip-plan.mjs";

export const photos = [
  "/assets/pexels-pixabay-208745.jpg",
  "/assets/pexels-francesco-ungaro-19857034.jpg",
  "/assets/pexels-officialakfotos-18556827.jpg",
  "/assets/pexels-andrea-roman-291935393-15475219.jpg",
];
export const initial = {
  trips: [
    {
      id: "lisbon",
      city: "Lisbon",
      country: "Portugal",
      title: "Chasing the golden hour",
      start: "2026-11-12",
      end: "2026-11-18",
      status: "Upcoming",
      image: photos[0],
      description:
        "Slow mornings, tiled streets, and sunsets by the water. A week to explore at our own pace.",
    },
    {
      id: "alps",
      city: "The Alps",
      country: "Switzerland",
      title: "A little closer to the sky",
      start: "2027-01-15",
      end: "2027-01-22",
      status: "Planning",
      image: photos[1],
      description:
        "Fresh mountain air, scenic trails, and a cozy place to come back to.",
    },
    {
      id: "lagos",
      city: "Lagos",
      country: "Nigeria",
      title: "A weekend to remember",
      start: "2026-09-12",
      end: "2026-09-15",
      status: "Completed",
      image: photos[2],
      description:
        "Exploring the city, finding new favorites, and making memories close to home.",
    },
  ],
  notes: [
    {
      id: "first-memory",
      trip: "lagos",
      name: "The best days have no itinerary",
      description:
        "We took the long way, stopped for lunch, and stayed until the light turned gold. A reminder to leave room for the unexpected.",
      type: "Experience",
      rating: "5",
      image: photos[2],
    },
  ],
};

export const storageKey = "track-trips-preview-v1";
export function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
export function validateFields(fields, isNote, trips) {
  const required = isNote
    ? ["name", "description", "trip", "type"]
    : ["title", "city", "country", "start", "end", "status"];
  for (const field of required) {
    if (typeof fields[field] !== "string" || !fields[field].trim())
      return "Fill in all required fields with more than spaces.";
  }
  if (isNote) {
    if (!trips.some((trip) => trip.id === fields.trip))
      return "Choose an existing trip before saving a memory.";
    if (fields.type.trim().length > 40 || /[\x00-\x1f]/.test(fields.type))
      return "Choose a valid memory category.";
    const rating = Number(fields.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return "Choose a rating from 1 to 5.";
  } else {
    if (!isDate(fields.start) || !isDate(fields.end))
      return "Choose valid start and end dates.";
    if (fields.end < fields.start)
      return "Choose an end date on or after your start date.";
    if (!["Planning", "Upcoming", "Completed"].includes(fields.status))
      return "Choose a valid trip status.";
  }
  if (
    required.some(
      (field) => field !== "description" && fields[field].length > 150,
    ) ||
    (fields.description?.length || 0) > 10000
  )
    return "Your entry is too long. Shorten the title or description.";
  return "";
}
export function parseTravelData(raw) {
  if (raw === null) return initial;
  const stored = JSON.parse(raw);
  if (!stored || !Array.isArray(stored.trips) || !Array.isArray(stored.notes))
    throw new Error("Invalid workspace data");
  const validId = (id) =>
    typeof id === "string" && /^[a-zA-Z0-9_-]{1,150}$/.test(id);
  const validImage = (value) =>
    value === undefined ||
    photos.includes(value) ||
    (typeof value === "string" && /^\/api\/photos\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(value)) ||
    (typeof value === "string" &&
      /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value));
  const trips = stored.trips.map((trip) => {
    if (trip?.plan !== undefined) validatePlan(trip.plan);
    if (trip?.sourceStory !== undefined && (!trip.sourceStory || typeof trip.sourceStory.author !== "string" || trip.sourceStory.author.length > 60 || typeof trip.sourceStory.id !== "string" || !/^[a-f0-9-]{36}$/.test(trip.sourceStory.id))) throw new Error("Invalid story attribution");
    if (
      !trip ||
      !validId(trip.id) ||
      validateFields(trip, false, []) ||
      !validImage(trip.image) ||
      (trip.description !== undefined && typeof trip.description !== "string")
    )
      throw new Error("Invalid saved trip");
    return {
      ...trip,
      image: trip.image || photos[0],
      description: trip.description || "",
    };
  });
  const notes = stored.notes.map((note) => {
    if (
      !note ||
      !validId(note.id) ||
      validateFields(note, true, trips) ||
      !validImage(note.image)
    )
      throw new Error("Invalid saved memory");
    return { ...note, image: note.image || photos[0] };
  });
  for (const collection of [trips, notes])
    if (new Set(collection.map((entry) => entry.id)).size !== collection.length)
      throw new Error("Duplicate saved record");
  return { ...stored, trips, notes };
}
export function upsertRecord(current, collection, record, editing) {
  const isNote = collection === "notes";
  const message = validateFields(record, isNote, current.trips);
  if (message) throw new Error(message);
  if (editing && !current[collection].some((entry) => entry.id === record.id))
    throw new Error(
      "This record was removed in another tab. Return to your workspace.",
    );
  return {
    ...current,
    [collection]: editing
      ? current[collection].map((entry) =>
          entry.id === record.id ? record : entry,
        )
      : [record, ...current[collection]],
  };
}
export function deleteRecord(current, collection, id) {
  return collection === "notes"
    ? { ...current, notes: current.notes.filter((note) => note.id !== id) }
    : {
        ...current,
        trips: current.trips.filter((trip) => trip.id !== id),
        notes: current.notes.filter((note) => note.trip !== id),
      };
}
