"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function Edit(id, city, start, end, country) {
  await xata.db.trips.update(id, {
    city: city,
    country: country,
    start: start,
    end: end,
  });
}

export async function editNote(
  name,
  description,
  type,
  rating,
  mediaType,
  tripId
) {
  const record = await xata.db.notes.update(
    tripId,
    {
      name: name,
      description: description,
      type: type,
      rating: parseInt(rating),
      trip: tripId,
      img: { mediaType, base64Content: "" },
    },
    ["*", "img.uploadUrl"]
  );
  return { uploadUrl: record.img?.uploadUrl };
}
