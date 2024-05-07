"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function deleteTrip(id) {
  await xata.db.trips.delete(id);
}
