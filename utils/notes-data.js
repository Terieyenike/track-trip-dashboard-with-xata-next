"use server";

import { XataFile } from "@xata.io/client";
import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function notesData(name, description, type, rating, img) {
  const record = await xata.db.notes.create({
    name: name,
    description: description,
    type: type,
    rating: parseInt(rating),
    img: XataFile.fromBase64("SGVsbG8gV29ybGQ=", {
      name: img,
    }),
  });
  console.log(record);
}
