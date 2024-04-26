"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function notesData(name, description, type, rating, mediaType) {
  const record = await xata.db.notes.create(
    {
      name: name,
      description: description,
      type: type,
      rating: parseInt(rating),
      img: { mediaType, base64Content: "" },
    },
    ["*", "img.uploadUrl"]
  );
  return { uploadUrl: record.img?.uploadUrl };
}
