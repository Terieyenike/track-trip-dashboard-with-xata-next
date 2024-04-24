"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function notesData(name, description, type, rating, img) {
  const record = await xata.db.notes.create(
    {
      name: name,
      description: description,
      type: type,
      rating: parseInt(rating),
      img: { mediaType: img, base64Content: "" },
    },
    ["*", "img.uploadUrl"]
  );
  console.log(record);
}
