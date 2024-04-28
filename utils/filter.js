"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function filter(id) {
  await xata.db.notes.read(id);
}
