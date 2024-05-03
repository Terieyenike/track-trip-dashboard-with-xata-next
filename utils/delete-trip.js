"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function deleteTrip(id) {
  const record = await xata.db.trips.delete(id);

  console.log(record);
}
