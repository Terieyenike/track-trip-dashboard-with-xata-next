"use server";

import { getXataClient } from "@/src/xata";

export async function getTrips() {
  const xata = getXataClient();
  const trips = await xata.db.trips.getAll();
  const serializedTrips = JSON.stringify(trips);
  return serializedTrips;
}
