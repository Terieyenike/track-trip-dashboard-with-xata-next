import {pageMetadata} from "@/lib/page-metadata";
import { TravelPage } from "@/components/TravelApp";
export default function Page() {
  return <TravelPage mode="notes" />;
}

export const metadata = pageMetadata('Travel journal','Keep your travel memories, experiences, and personal reflections in your private journal.',true);
