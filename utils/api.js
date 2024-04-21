"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function submitTripData(city, country, start, end) {
  await xata.db.trips.create({
    city: city,
    country: country,
    start: start,
    end: end,
  });
}

// export async function notesData() {
//   await xata.db.notes.create({

//   })
// }
