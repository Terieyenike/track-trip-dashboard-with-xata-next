import {pageMetadata} from "@/lib/page-metadata";
import { TravelPage } from "@/components/TravelApp";
export default async function Page(props) {
  const params = await props.params;
  return <TravelPage mode="trip-detail" id={params.id} />;
}

export const metadata = pageMetadata('Trip planner','Plan your itinerary, compare estimated and actual spending, and collect memories from your trip.',true);
