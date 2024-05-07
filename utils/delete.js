"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function deleteNote(id) {
  xata.db.notes.delete(id);
}
