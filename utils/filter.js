"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function filter(params) {
  return xata.db.notes.read({ id: params.id });
}
