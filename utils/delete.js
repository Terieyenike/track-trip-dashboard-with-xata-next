"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function deleteNote(id) {
  const record = await xata.db.notes.delete(id);
  console.log(record);
}
