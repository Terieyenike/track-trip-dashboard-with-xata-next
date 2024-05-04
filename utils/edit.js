"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function Edit(id, city, start, end, country) {
  await xata.db.trips.update(id, {
    city: city,
    country: country,
    start: start,
    end: end,
  });
}
