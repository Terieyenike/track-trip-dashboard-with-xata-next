import {pageMetadata} from "@/lib/page-metadata";
import { TravelPage } from "@/components/TravelApp";
export default async function Page(props) {
  const params = await props.params;
  return <TravelPage mode="trip-form" id={params.id} />;
}

export const metadata = pageMetadata('Edit trip','Update your destination, travel dates, and private trip details.',true);
