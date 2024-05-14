"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function filterTrip(params) {
  const data = await xata.db.trips.read({ id: params.id });

  return { data: JSON.parse(JSON.stringify(data)) };
}
