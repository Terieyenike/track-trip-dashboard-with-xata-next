"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function filter(params) {
  const record = await xata.db.notes.read({ id: params.id });

  return { record };
}

export async function filterNote(params) {
  const record = await xata.db.notes.read({ id: params.id });

  return { record: JSON.parse(JSON.stringify(record)) };
}
