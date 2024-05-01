"use server";

import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function filter(params) {
	const data = await xata.db.notes.read({ id: params.id });

	return data;
}
