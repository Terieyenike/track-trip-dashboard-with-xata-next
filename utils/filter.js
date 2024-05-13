"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function filter(params) {
  const record = await xata.db.notes.read({ id: params.id });
  const { description, id, img, name, rating, trip, type } = record;

  const plainRecord = {
    description,
    id,
    img,
    name,
    rating,
    trip,
    type,
  };

  console.log(plainRecord);
  return { record, plainRecord };
}
