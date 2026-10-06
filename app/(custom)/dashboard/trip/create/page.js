import {pageMetadata} from "@/lib/page-metadata";
import { TravelPage } from "@/components/TravelApp";
export default function Page() {
  return <TravelPage mode="trip-form" />;
}

export const metadata = pageMetadata('Plan a trip','Choose your destination and dates to start a private trip plan.',true);
