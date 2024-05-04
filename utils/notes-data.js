"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function notesData(
  name,
  description,
  type,
  rating,
  mediaType,
  trip
) {
  // const tripId = String(id);
  const record = await xata.db.notes.create(
    {
      name: name,
      description: description,
      type: type,
      trip: String(trip),
      rating: parseInt(rating),
      img: { mediaType, base64Content: "" },
    },
    ["*", "img.uploadUrl"]
  );
  console.log(record);
  return { uploadUrl: record.img?.uploadUrl };
}
