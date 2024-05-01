"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function update({ params }) {
  const record = await xata.db.notes.read({ id: params.id });
  return record;
}
