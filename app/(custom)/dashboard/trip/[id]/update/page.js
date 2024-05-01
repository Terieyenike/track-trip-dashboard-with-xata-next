// "use client";

// import { useState } from "react";
import { getXataClient } from "@/src/xata";

export default async function Update({ params }) {
  const xata = getXataClient();
  const record = await xata.db.trips.read({ id: params.id });

  return (
    <>
      <h1>{record.city}</h1>
    </>
  );
}
