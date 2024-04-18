"use server";

import { getXataClient } from "@/src/xata";

export async function submitTripData(city, country, start, end) {
  const xata = getXataClient();
  await xata.db.trips.create({
    city: city,
    country: country,
    start: start,
    end: end,
  });
}
