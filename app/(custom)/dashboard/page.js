import {pageMetadata} from "@/lib/page-metadata";
import { TravelPage } from "@/components/TravelApp";
export default function Page() {
  return <TravelPage mode="trips" />;
}

export const metadata = pageMetadata('My trips','Manage your private trips, itineraries, budgets, packing lists, and travel memories.',true);
