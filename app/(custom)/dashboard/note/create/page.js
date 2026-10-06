import {pageMetadata} from "@/lib/page-metadata";
import { TravelPage } from "@/components/TravelApp";
export default function Page() {
  return <TravelPage mode="note-form" />;
}

export const metadata = pageMetadata('Capture a memory','Record a travel moment with your own category, story, rating, and private photo.',true);
