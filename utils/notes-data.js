"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function notesData(
  name,
  description,
  type,
  rating,
  mediaType,
  tripId
) {
  const record = await xata.db.notes.create(
    {
      name: name,
      description: description,
      type: type,
      trip: tripId,
      rating: parseInt(rating),
      img: { mediaType, base64Content: "", name: name },
    },
    ["*", "img.uploadUrl"]
  );
  return { uploadUrl: record.img?.uploadUrl };
}
