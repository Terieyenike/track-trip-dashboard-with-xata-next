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

export async function notesData(name, description, img, rating, type) {
  await xata.db.notes.create({
    name: name,
    description: description,
    img: img,
    rating: rating,
    type: type,
  });
}
