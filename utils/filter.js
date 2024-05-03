"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function filter(params) {
  const data = await xata.db.notes.read({ id: params.id });

  return data;
}

export async function filterTrip(params) {
  const data = await xata.db.trips.read({ id: params.id });
  return data;
}
