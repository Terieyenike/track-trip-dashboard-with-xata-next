"use server";

import { getXataClient } from "@/src/xata";

export async function apiNoteDetail() {
  const xata = getXataClient();
  const notes = await xata.db.notes.select(["*", "trip"]).getMany();
  const serializedNotes = JSON.stringify(notes);
  return serializedNotes;
}
