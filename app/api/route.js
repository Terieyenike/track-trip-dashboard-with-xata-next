import { getXataClient } from "@/src/xata";
const xata = getXataClient();

export async function POST(request) {
  const { city, country, start, end } = request.body;
  const res = await xata.db.trips.create({
    city,
    country,
    start,
    end,
  });
  const data = await res.json();
  return Response.json(data);
}
