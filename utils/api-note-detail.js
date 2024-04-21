"use server";

import { getXataClient } from "@/src/xata";

export async function apiNoteDetail() {
  const xata = getXataClient();
  const notes = await xata.db.notes.getAll();

  return notes;
}
